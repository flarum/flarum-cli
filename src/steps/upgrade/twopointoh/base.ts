import * as t from '@babel/types';
import { Store } from 'mem-fs';
import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { Step } from 'boilersmith/step-manager';
import pick from 'pick-deep';
import { FlarumProviders } from '../../../providers';
import { formatCode, generateCode, ModuleImport, parseCode, populateImports } from '../../../utils/ast';
import { create, Editor } from 'mem-fs-editor';
import { commitAll } from '../../monorepo/create';
import BaseCommand from '../../../base-command';
import globby from 'globby';
import chalk from 'chalk';
import s from 'string';
import simpleGit from 'simple-git';
import { cloneNode } from '@babel/types';
import { PhpProvider } from '../../../providers/php-provider';

export type ReplacementResult = {
  imports?: ImportChange[];
  newPath?: string | null;
  newFiles?: { path: string; code: string }[];
  delete?: boolean;
  updated: string | AdvancedContent;
};

export type Replacement = (file: string, code: string, advanced: AdvancedContent) => null | ReplacementResult | Promise<null | ReplacementResult>;

export type AdvancedContent = t.File | Record<string, any> | null;

export type ImportChange = {
  replacesPath?: string | null;
  import: ModuleImport;
};

export type GitCommit = {
  message: string;
  description: string;
};

export abstract class BaseUpgradeStep implements Step<FlarumProviders> {
  abstract type: string;

  composable = true;

  exposes: string[] = [];

  getExposed(_paths: Paths, _paramProvider: IO): Record<string, unknown> {
    return pick(this.params, this.exposes) as Record<string, unknown>;
  }

  protected params!: Record<string, unknown>;

  protected command: BaseCommand;

  protected php: null | PhpProvider = null;

  protected step = 0;
  protected totalSteps = 0;
  protected forceStep = false;
  protected root: string;

  public constructor(command: BaseCommand, root: string, step: number, totalSteps: number, forceStep: boolean) {
    this.command = command;
    this.step = step;
    this.totalSteps = totalSteps;
    this.forceStep = forceStep;
    this.root = root;
  }

  protected beforeHook = false;

  before(_file: string, _code: string, _advanced: AdvancedContent): void {
    // ...
  }

  abstract targets(): string[];
  abstract replacements(file: string, code: string): Replacement[];
  abstract gitCommit(): GitCommit;
  abstract pauseMessage(): string;

  protected fsEditor: null | Editor = null;

  async run(fs: Store, paths: Paths, io: IO, providers: FlarumProviders): Promise<Store> {
    if (this.root !== paths.cwd()) {
      process.chdir(this.root);
    }

    const fsEditor = create(fs);

    this.fsEditor = fsEditor;

    this.php = providers.php;

    // Stop if there are uncommited changes
    const status = await simpleGit(paths.requestedDir() ?? paths.cwd()).status();

    if (status?.files.length) {
      this.command.error('You have uncommitted changes in your repository. Please commit or stash them before continuing.', {
        code: 'FL_ERR',
      });
    }

    const stepMarker = chalk.bgRed.bold('  STEP ' + this.step + '/' + this.totalSteps + '   ');
    this.command.log(stepMarker + ' ' + chalk.bold(this.type));
    this.command.log('');

    // Skip if this was already done (check by commits).
    if (!this.forceStep && (await this.alreadyCommited(paths.requestedDir() ?? paths.cwd(), this.gitCommit().message))) {
      this.command.log('     => ' + chalk.bgGreen.bold('    SKIP    '));
      this.command.log('');
      return fs;
    }

    // Show loading indicator
    let dots = 1;
    let nl = false;
    const progress = () => {
      if (!nl) {
        this.command.log('');
        nl = true;
      }

      const filledDots = '.'.repeat(dots) + ' '.repeat(3 - dots);
      this.command.log('\u001B[A     => ' + chalk.bold('  WORKING' + filledDots));

      dots = (dots + 1) % 4;
    };

    const targets = this.targets();

    for (const target of targets) {
      progress();

      // target can have a wildcard
      const files = target.includes('*')
        ? // eslint-disable-next-line no-await-in-loop
          await globby(paths.package(target))
        : [paths.package(target)];

      if (this.beforeHook) {
        for (const file of files) {
          if (!fsEditor.exists(file)) {
            continue;
          }

          const code = fsEditor.read(file);
          const advanced = this.advancedContent(file, code);

          this.before(file, code, advanced);

          progress();
        }
      }

      const newFiles: string[] = [];
      const deletedFiles: string[] = [];

      const applyOn = async (files: string[]) => {
        for (const file of files) {
          if (deletedFiles.includes(file) || !fsEditor.exists(file)) {
            continue;
          }

          const code = fsEditor.read(file);
          const advanced = this.advancedContent(file, code);

          const relativeTarget = s(file.replace(paths.package(), '')).stripLeft('/').stripLeft('\\').toString();

          // eslint-disable-next-line no-await-in-loop
          const result = await this.applyReplacements(relativeTarget, code, advanced);

          if (result.newPath && result.newPath !== file) {
            fsEditor.move(file, result.newPath!);
            newFiles.push(result.newPath!);
          }

          if (result.newFiles) {
            result.newFiles.forEach((newFile) => {
              fsEditor.write(newFile.path, newFile.code);
              newFiles.push(newFile.path);
            });
          }

          if (result.delete) {
            fsEditor.delete(file);
            deletedFiles.push(file);
          } else {
            const newCode = result.updated as string;
            fsEditor.write(result.newPath!, newCode);
          }
        }

        progress();

        await new Promise((resolve, _reject) => {
          fsEditor.commit((err) => {
            if (err) {
              throw new Error(err);
            }

            resolve(true);
          });
        });
      };

      // eslint-disable-next-line no-await-in-loop
      await applyOn(files);

      // if (newFiles.length > 0) {
      //   // eslint-disable-next-line no-await-in-loop
      //   await applyOn(newFiles);
      // }
    }

    const changesMade = await simpleGit(paths.requestedDir() ?? paths.cwd())
      .diffSummary()
      .then((summary) => summary.files.length > 0);

    if (changesMade) {
      await simpleGit(paths.requestedDir() ?? paths.cwd()).add('.');

      await this.pauseAndConfirm(this.pauseMessage(), io);

      const commit = this.gitCommit();
      const message = commit.message + '\n\n' + commit.description;
      await commitAll(paths.requestedDir() ?? paths.cwd(), message);

      this.command.log('\u001B[A     => ' + chalk.bgCyan.bold('   COMMIT   ') + ' ' + chalk.dim(commit.message));
      this.command.log('');
    } else {
      this.command.log('\u001B[A     => ' + chalk.bgGreen.bold(' NO CHANGES '));
      this.command.log('');
    }

    return fs;
  }

  async applyReplacements(file: string, code: string, advanced: AdvancedContent): Promise<ReplacementResult> {
    let newPath = file;
    let newFiles: any;

    for (const callback of this.replacements(file, code)) {
      // eslint-disable-next-line no-await-in-loop
      const result = await callback(file, code, advanced);

      if (result?.newFiles) {
        newFiles = result.newFiles;
      }

      if (result?.delete) {
        return {
          delete: true,
          updated: null,
          newFiles,
        };
      }

      if (!result) continue;

      // eslint-disable-next-line no-await-in-loop
      code = await this.updateCode(file, code, result.updated);

      if (result.imports?.length || (result.updated && typeof result.updated !== 'string' && 'program' in result.updated)) {
        try {
          advanced = parseCode(code);
        } catch (error) {
          this.command.warn(`Failed to parse code for ${file}, code: \n${code}`);
          throw error;
        }

        result.imports?.forEach((imp) => {
          this.ensureImport(file, advanced, imp);
        });

        // eslint-disable-next-line no-await-in-loop
        code = await generateCode(advanced as t.File, false);
      }

      if (result.newPath) {
        newPath = result.newPath;
      }
    }

    return {
      newPath,
      newFiles,
      updated: code,
    };
  }

  ensureImport(file: string, advanced: AdvancedContent, imp: ImportChange): void {
    const frontend = file.split('/src/')[1].split('/')[0];
    const ast = advanced as t.File;

    // Remove old import first.
    let index: number | null = null;
    let postAdd = null;

    if (imp.replacesPath) {
      index = ast.program.body.findIndex((node) => {
        if (!t.isImportDeclaration(node)) return false;

        return node.source.value === imp.replacesPath;
      });

      const replaces = cloneNode(ast.program.body[index] as t.ImportDeclaration);
      replaces.specifiers = replaces.specifiers.filter((specifier) => !t.isImportDefaultSpecifier(specifier));

      if (imp.import.defaultImport && replaces?.specifiers?.length) {
        postAdd = () => ast.program.body.splice(index!, 0, replaces);
      }

      if (index >= 0) {
        ast.program.body.splice(index, 1);
      }
    }

    populateImports(ast, imp.import, {}, {}, frontend, index);

    postAdd?.();
  }

  advancedContent(file: string, code: string): AdvancedContent {
    const lang = file.split('.').pop();

    if (lang === 'json') {
      // remove comments
      code = code.replace(/^\s*\/\/.*$/gm, '');
      // remove loose ,
      code = code.replace(/,\s*}/g, '}');

      try {
        return JSON.parse(code);
      } catch {
        this.command.error(`Failed to parse JSON file ${file}`);
      }
    }

    if (['js', 'ts', 'jsx', 'tsx'].includes(lang || '')) {
      return parseCode(code);
    }

    return null;
  }

  async updateCode(file: string, code: string, updated: string | AdvancedContent): Promise<string> {
    const lang = file.split('.').pop();

    if (['js', 'ts', 'jsx', 'tsx'].includes(lang || '') && typeof updated === 'string') {
      return formatCode(updated, false);
    }

    if (typeof updated === 'string') {
      return updated;
    }

    if (lang === 'json') {
      const space = file === 'composer.json' ? 4 : 2;

      return JSON.stringify(updated, null, space);
    }

    if (updated && 'program' in updated) {
      try {
        return generateCode(updated as t.File, false);
      } catch (error) {
        this.command.warn(`Failed to generate code for ${file}, code: \n${code}`);
        throw error;
      }
    }

    return code;
  }

  protected async pauseAndConfirm(message: string, io: IO): Promise<void> {
    const stepMarker = chalk.bgWhite.black.bold('    DONE    ');

    this.command.log('\u001B[A     => ' + stepMarker + ' ' + message);
    this.command.log('');

    await this.command.continueWhenReady(io);
  }

  protected async alreadyCommited(path: string, message: string): Promise<boolean> {
    const log = await simpleGit(path).log({
      file: '.',
      maxCount: 20,
    });

    return log.all.some((commit) => commit.message === message);
  }
}
