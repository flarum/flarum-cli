import globby from 'globby';
import {Store} from 'mem-fs';
import {create} from 'mem-fs-editor';
import {IO, ParamDef} from 'boilersmith/io';
import {Paths} from 'boilersmith/paths';
import {Step} from 'boilersmith/step-manager';
import {FlarumProviders} from '../../providers';
import addExtenders from "../../utils/add-extenders";
import {ExtenderDef} from "../../providers/php-provider";
import {ExtenderGenerationSchema} from "../extenders/base";
import {cloneAndFill} from "boilersmith/utils/clone-and-fill";

const IMPORTS_REGEX = /((^import\s+(?:([\s\w*,{}]+)\s+from)?\s*["']?([\s\w./@\\-]+)\3?["']?\s*;?\s*)*)(.*)/m;
const INIT_REGEX = /^(app\.initializers\.add\('[^']+',\s*\(\)\s*=>\s*{)$/m;

export type InitializerDefinition = {
  code: string;
  imports: string;
};

export abstract class BaseJsStep implements Step<FlarumProviders> {
  abstract type: string;

  protected abstract schema: ExtenderGenerationSchema;

  composable = true;

  exposes = [];

  getExposed(_paths: Paths, _paramProvider: IO): Record<string, unknown> {
    return {};
  }

  protected params!: Record<string, unknown>;

  async run(fs: Store, paths: Paths, io: IO, _providers: FlarumProviders): Promise<Store> {
    const fsEditor = create(fs);

    this.params = await this.compileParams(io);

    const extender = cloneAndFill<ExtenderDef>(this.schema.extenderDef, this.params as Record<string, string>);

    const frontend: string = await io.getParam({
      name: 'frontend',
      message: 'Frontend',
      type: 'text',
      choices: ['forum', 'admin', 'api'].map((type: string) => ({
        title: type,
        value: type.toLowerCase(),
      })),
    });
    let frontends: string[] = [frontend];

    if (frontend === 'common') {
      frontends = ['admin', 'forum'];
    }

    for (const frontend of frontends) {
      const fsSrcFilePaths = globby.sync(paths.package(`js/src/${frontend}/*.{js,jsx,ts,tsx}`));

      // eslint-disable-next-line no-await-in-loop
      const definition = await this.getDefinition(frontend, paths, io);

      for (const match of fsSrcFilePaths) {
        if (match.includes('extend.') && extender) {
          addExtenders(match, [extender]);
        }

        if (! definition) continue;

        const currContents = fsEditor.read(match);

        // skip if no INIT_REGEX is found
        if (!INIT_REGEX.test(currContents)) {
          continue;
        }

        const newContents = currContents.replace(INIT_REGEX, `$1\n  ${definition.code}\n`).replace(IMPORTS_REGEX, `$1${definition.imports}\n\n$5`);

        fsEditor.write(match, newContents);
      }
    }

    return fs;
  }

  protected abstract getDefinition(frontend: string, paths: Paths, io: IO): Promise<InitializerDefinition|null>;

  protected importPath(frontend: string, classNamespace: string): string {
    let path = `../${classNamespace}`;

    path = path.replace(`../${frontend}/`, './');

    return path;
  }

  protected async compileParams(io: IO): Promise<Record<string, unknown>> {
    const params: Record<string, string> = {};

    const paramDefs = this.schema.params;
    for (const paramDef of paramDefs) {
      // eslint-disable-next-line no-await-in-loop
      params[paramDef.name as string] = await io.getParam(paramDef as ParamDef);
    }

    return params;
  }
}
