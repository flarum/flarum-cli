import { Store } from 'mem-fs';
import { create } from 'mem-fs-editor';
import { IO, ParamDef } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { ExtenderDef } from '../../providers/php-provider';
import { Step } from 'boilersmith/step-manager';
import { FlarumProviders } from '../../providers';
import { Scaffolder } from 'boilersmith/scaffolding/scaffolder';
import { ExtensionModules, ExtensionParams } from '../gen-ext-scaffolder';
import { resolve } from 'path';
import YAML from 'yaml';

interface UserProvidedParam extends Omit<ParamDef, 'type'> {
  type: string;
}

export interface ExtenderGenerationSchema {
  extenderDef: ExtenderDef;

  params: UserProvidedParam[];
}

export class LocaleStep implements Step<FlarumProviders> {
  type = 'Generate key-value locale pair';

  composable = true;

  exposes = [];

  getExposed(): Record<string, unknown> {
    return {};
  }

  protected params!: Record<string, unknown>;

  protected scaffolder: Scaffolder<ExtensionParams, ExtensionModules>;

  constructor(scaffolder: Scaffolder<ExtensionParams, ExtensionModules>) {
    this.scaffolder = scaffolder;
  }

  async run(fs: Store, paths: Paths, io: IO, _providers: FlarumProviders): Promise<Store> {
    const fsEditor = create(fs);

    this.params = await this.compileParams(fs, paths, io);

    let path;

    if (fsEditor.exists(paths.package('resources/locale/en.yml'))) {
      path = paths.package('resources/locale/en.yml');
    } else {
      path = paths.package('locale/en.yml');

      // Ensure locale/en.yml exists
      if (!fsEditor.exists(path)) {
        const stubFilePath = resolve(__dirname, `../../../boilerplate/skeleton/extension/locale/en.yml`);
        fsEditor.copyTpl(stubFilePath, path, {params: this.params});
      }
    }

    const doc = YAML.parseDocument(fsEditor.read(path));

    const key =
      (this.params.key as string).split('.')[0] === this.params.extensionId ? this.params.key : `${this.params.extensionId}.${this.params.key}`;

    const keys = (key as string).split('.');
    const keyPath = [];

    try {
      // eslint-disable-next-line guard-for-in
      for (const i in keys) {
        const k = keys[i];

        if (doc.hasIn(keyPath) && doc.getIn(keyPath) !== null) {
          keyPath.push(k);
        } else {
          const remainingKeyPath = keys.slice(Number.parseInt(i, 10));
          const remainingAsNestedObject = {};
          setNested(remainingKeyPath.join('.'), this.params.value as string, remainingAsNestedObject);
          doc.setIn(keyPath, remainingAsNestedObject);
          break;
        }
      }

      if (keyPath.join('.') === key) {
        doc.setIn(keyPath, this.params.value);
      }
    } catch {
      // Do nothing
    }

    fsEditor.write(path, doc.toString({
      lineWidth: 200,
    }));

    return fs;
  }

  protected async compileParams(fs: Store, paths: Paths, io: IO): Promise<Record<string, unknown>> {
    const params: Record<string, string> = {};

    params.extensionId = await this.scaffolder.templateParamVal('extensionId', fs, paths, io);

    params.key = await io.getParam({
      name: 'key',
      type: 'text',
      message: 'The nested key of the locale (e.g. `forum.custom_modal.title`).',
    });

    params.value = await io.getParam({
      name: 'value',
      type: 'text',
      message: 'The value of the locale.',
    });

    return params;
  }
}

/**
 * nested key format, e.g: forum.custom_model.title
 * obj: forum: { custom_modal: title: '' }
 */
export function setNested(key: string, value: string, object: Record<string, any>): void {
  const keys = key.split('.');
  let current = object;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k]) {
      current[k] = {};
    }

    current = current[k];
  }

  current[keys[keys.length - 1]] = value;
}
