import globby from 'globby';
import { Store } from 'mem-fs';
import { create, Editor } from 'mem-fs-editor';
import { IO, ParamDef } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { Step } from 'boilersmith/step-manager';
import { FlarumProviders } from '../../providers';
import addExtenders from '../../utils/add-extenders';
import { ExtenderDef } from '../../providers/php-provider';
import { ExtenderGenerationSchema } from '../extenders/base';
import { cloneAndFill } from 'boilersmith/utils/clone-and-fill';
import { genExtScaffolder } from '../gen-ext-scaffolder';
import { applyImports, generateCode, ModuleImport, parseCode } from '../../utils/ast';
import { resolve } from 'path';
import pick from 'pick-deep';

const INIT_REGEX = /^(app\.initializers\.add\('[^']+',\s*\(\)\s*=>\s*{)$/m;

export type InitializerDefinition = {
  code: string;
  imports: ModuleImport[];
};

export abstract class BaseJsStep implements Step<FlarumProviders> {
  abstract type: string;

  protected abstract schema: ExtenderGenerationSchema | null;

  composable = true;

  exposes: string[] = [];

  getExposed(_paths: Paths, _paramProvider: IO): Record<string, unknown> {
    return pick(this.params, this.exposes) as Record<string, unknown>;
  }

  protected params!: Record<string, unknown>;

  async run(fs: Store, paths: Paths, io: IO, _providers: FlarumProviders): Promise<Store> {
    const fsEditor = create(fs);

    this.params = await this.compileParams(io);

    const extender = (this.schema && cloneAndFill<ExtenderDef>(this.schema.extenderDef, this.params as Record<string, string>)) || null;

    const frontend: string = await io.getParam({
      name: 'frontend',
      message: 'Frontend',
      type: 'text',
      choices: ['forum', 'admin', 'api'].map((type: string) => ({
        title: type,
        value: type.toLowerCase(),
      })),
    });

    this.ensureFrontendFilesExist(paths, fsEditor);

    this.params = {
      ...this.params,
      ...(await genExtScaffolder().templateParamVals(fs, paths, io)),
    };

    const fsSrcFilePaths = globby.sync(paths.package(`js/src/${frontend}/*.{js,jsx,ts,tsx}`));

    const definition = await this.getDefinition(frontend, paths, io);

    for (const match of fsSrcFilePaths) {
      if (match.includes('extend.') && extender) {
        addExtenders(match, [extender], frontend);
      }

      if (!definition) continue;

      const currContents = fsEditor.read(match);

      // skip if no INIT_REGEX is found
      if (!INIT_REGEX.test(currContents)) {
        continue;
      }

      let newContents = currContents.replace(INIT_REGEX, `$1\n  ${definition.code}\n`);

      const imports = definition.imports;

      if (imports) {
        const ast = parseCode(newContents);
        applyImports(ast, frontend, imports);
        // eslint-disable-next-line no-await-in-loop
        newContents = await generateCode(ast);
      }

      fsEditor.write(match, newContents);
    }

    return fs;
  }

  protected abstract getDefinition(frontend: string, paths: Paths, io: IO): Promise<InitializerDefinition | null>;

  protected async compileParams(io: IO): Promise<Record<string, unknown>> {
    const params: Record<string, string> = {};

    const paramDefs = this.schema?.params;

    if (!paramDefs) {
      return params;
    }

    for (const paramDef of paramDefs) {
      // eslint-disable-next-line no-await-in-loop
      params[paramDef.name as string] = await io.getParam(paramDef as ParamDef);
    }

    return params;
  }

  protected ensureFrontendFilesExist(paths: Paths, fsEditor: Editor): void {
    const extensions = ['js', 'ts', 'jsx', 'tsx'];
    const fileNames = ['index', 'extend'];

    for (const frontend of ['admin', 'forum', 'common']) {
      const existingFilesMatchingNames: string[] = [];

      for (const fileName of fileNames) {
        for (const extension of extensions) {
          const filePath = paths.package(`js/src/${frontend}/${fileName}.${extension}`);

          if (!existingFilesMatchingNames.includes(fileName) && fsEditor.exists(filePath)) {
            existingFilesMatchingNames.push(fileName);
          }
        }
      }

      for (const fileName of fileNames) {
        if (!existingFilesMatchingNames.includes(fileName)) {
          const stubFilePath = resolve(__dirname, `../../../boilerplate/skeleton/extension/js/src/${frontend}/${fileName}.js`);
          fsEditor.copyTpl(stubFilePath, paths.package(`js/src/${frontend}/${fileName}.js`), { params: this.params });
        }
      }

      for (const fileName of fileNames) {
        for (const extension of extensions) {
          const filePath = paths.package(`js/src/${frontend}/${fileName}.${extension}`);
          let contents = '';

          if (!fsEditor.exists(filePath)) {
            continue;
          }

          contents = fsEditor.read(filePath);

          if (
            fsEditor.exists(filePath) &&
            fileName === 'index' &&
            frontend !== 'common' &&
            !contents.includes("export { default as extend } from './extend';")
          ) {
            fsEditor.write(filePath, `export { default as extend } from './extend';\n${contents}`);
          }

          if (
            fsEditor.exists(filePath) &&
            fileName === 'extend' &&
            frontend !== 'common' &&
            !contents.includes("import commonExtend from '../common/extend';")
          ) {
            contents = `import commonExtend from '../common/extend';\n${contents}`;
            contents.replace('export default [', 'export default [...commonExtend,');
            fsEditor.write(filePath, contents);
          }
        }
      }
    }
  }
}
