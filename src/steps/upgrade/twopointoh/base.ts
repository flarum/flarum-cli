import * as t from '@babel/types';
import { Store } from 'mem-fs';
import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { Step } from 'boilersmith/step-manager';
import pick from 'pick-deep';
import {FlarumProviders} from "../../../providers";
import {applyImports, generateCode, ModuleImport, parseCode} from "../../../utils/ast";
import {create} from "mem-fs-editor";
import {commitAll} from "../../monorepo/create";
import BaseCommand from "../../../base-command";
import globby from "globby";
import chalk from "chalk";
import s from "string";
import simpleGit from "simple-git";

export type ReplacementResult = {
  imports?: ModuleImport[];
  newPath?: string;
  updated: string | AdvancedContent;
};

export type Replacement = (file: string, code: string, advanced: AdvancedContent) => null|ReplacementResult|Promise<null|ReplacementResult>;

export type AdvancedContent = t.File|Record<string, any>|null;

export type GitCommit = {
  message: string;
  description: string;
}

export abstract class BaseUpgradeStep implements Step<FlarumProviders> {
  abstract type: string;

  composable = true;

  exposes: string[] = [];

  getExposed(_paths: Paths, _paramProvider: IO): Record<string, unknown> {
    return pick(this.params, this.exposes) as Record<string, unknown>;
  }

  protected params!: Record<string, unknown>;

  protected command: BaseCommand;

  constructor(command: BaseCommand) {
    this.command = command;
  }

  abstract targets(): string[];
  abstract replacements(file: string, code: string): Replacement[];
  abstract gitCommit(): GitCommit;
  abstract pauseMessage(): string;

  async run(fs: Store, paths: Paths, io: IO, _providers: FlarumProviders): Promise<Store> {
    const fsEditor = create(fs);

    // Skip if this was already done (check by commits).
    if (await this.alreadyCommited(paths.requestedDir() ?? paths.cwd(), this.gitCommit().message)) {
      const skipMarker = chalk.bgGreen.bold('SKIP');
      this.command.log(skipMarker + ' ' + chalk.bold(this.type));
      this.command.log('');
      return fs;
    }

    const targets = this.targets();

    for (const target of targets) {
      // target can have a wildcard
      const files = target.includes('*')
        // eslint-disable-next-line no-await-in-loop
        ? await globby(paths.package(target))
        : [paths.package(target)];

      for (const file of files) {
        const code = fsEditor.read(file);
        const advanced = this.advancedContent(file, code);

        const relativeTarget = s(file.replace(paths.package(), '')).stripLeft('/').stripLeft('\\').toString();

        // eslint-disable-next-line no-await-in-loop
        const result = await this.applyReplacements(relativeTarget, code, advanced);

        if (result.newPath !== file) {
          fsEditor.move(file, result.newPath!);
        }

        fsEditor.write(result.newPath!, result.updated as string);
      }
    }

    await new Promise((resolve, _reject) => {
      fsEditor.commit((err) => {
        if (err) {
          throw new Error(err);
        }

        resolve(true);
      });
    });

    const changesMade = await simpleGit(paths.requestedDir() ?? paths.cwd()).diffSummary().then((summary) => summary.files.length > 0);

    if (changesMade) {
      await this.pauseAndConfirm(this.pauseMessage(), io);

      const commit = this.gitCommit();
      const message = commit.message + '\n\n' + commit.description;
      await commitAll(paths.requestedDir() ?? paths.cwd(), message);

      this.command.log(chalk.green(commit.message));
      this.command.log('');
    } else {
      const skipMarker = chalk.bgGreen.bold('NO CHANGES');
      this.command.log(skipMarker + ' ' + chalk.bold(this.type));
      this.command.log('');
    }

    return fs;
  }

  async applyReplacements(file: string, code: string, advanced: AdvancedContent): Promise<ReplacementResult> {
    let newPath = file;

    for (const callback of this.replacements(file, code)) {
      // eslint-disable-next-line no-await-in-loop
      const result = await callback(file, code, advanced);

      if (! result) continue;

      // eslint-disable-next-line no-await-in-loop
      code = await this.updateCode(file, code, result.updated);

      if ((result.imports?.length ?? 0) > 0) {
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
        code = await generateCode(advanced as t.File);
      }

      if (result.newPath) {
        newPath = result.newPath;
      }
    }

    return {
      newPath,
      updated: code,
    };
  }

  ensureImport(file: string, advanced: AdvancedContent, imp: ModuleImport): void {
    const frontend = file.split('/src/')[1].split('/')[0];
    applyImports(advanced as t.File, frontend, [imp]);
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

    if (lang === 'js') {
      return parseCode(code);
    }

    return null;
  }

  async updateCode(file: string, code: string, updated: string | AdvancedContent): Promise<string> {
    const lang = file.split('.').pop();

    if (typeof updated === 'string') {
      return updated;
    }

    if (lang === 'json') {
      const space = file === 'composer.json' ? 4 : 2;

      return JSON.stringify(updated, null, space);
    }

    if (updated && 'program' in updated) {
      try {
        return generateCode(updated as t.File);
      } catch (error) {
        this.command.warn(`Failed to generate code for ${file}, code: \n${code}`);
        throw error;
      }
    }

    return code;
  }

  protected async pauseAndConfirm(message: string, io: IO): Promise<void> {
    const stepMarker = chalk.bgWhite.black.bold('STEP');

    this.command.log(stepMarker + ' ' + message);
    this.command.log('');

    await this.continueWhenReady(io);
  }

  protected async continueWhenReady(io: IO): Promise<void> {
    const continueUpgrade = await io.getParam({
      name: 'continue',
      type: 'confirm',
      message: 'Ready to continue?',
      initial: true,
    });

    if (! continueUpgrade) {
      await this.continueWhenReady(io);
    }
  }

  protected async alreadyCommited(path: string, message: string): Promise<boolean> {
    const log = await simpleGit(path).log({
      file: '.',
      maxCount: 10,
    });

    return log.all.some((commit) => commit.message === message);
  }
}
