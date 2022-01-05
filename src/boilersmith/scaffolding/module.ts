import chalk from 'chalk';
import { Store } from 'mem-fs';
import { create } from 'mem-fs-editor';
import { resolve } from 'node:path';
import pick from 'pick-deep';
import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { readTpl } from 'boilersmith/utils/read-tpl';
import { cloneAndFill } from 'boilersmith/utils/clone-and-fill';
import { renameKeys } from 'boilersmith/utils/rename-keys';
import { condFormat } from 'boilersmith/utils/cond-format';

interface FileOwnership {
  /**
   * The path to the file
   */
  path: string;

  /**
   * Where the file should go. Defaults to path.
   */
  destPath?: string;

  /**
   * If any of the needed modules aren't enabled, the file won't be updated.
   */
  needsOtherModules?: string[];

  /**
   * If in a monorepo, should the file be placed relative to the monorepo root, and if so, where?
   * If provided, takes priority over destPath.
   */
  monorepoPath?: string;
}

interface CommonModule<N extends string> {
  name: N;

  shortDescription: string;

  longDescription?: string;

  /**
   * Whether files belonging to this module should be kept up to date.
   */
  updatable: boolean;

  /**
   * A list of scaffolding files managed by this module.
   */
  filesToReplace: (string | FileOwnership)[];

  /**
   * A map of names of JSON files to keys which should be deep-merged from the scaffolding.
   */
  jsonToAugment: Record<string, string[]>;

  /**
   * An array of names of template params needed by this module.
   */
  needsTemplateParams: string[];
}

interface UntoggleableModule<N extends string> extends CommonModule<N> {
  /**
   * Whether this module can be enabled/disabled.
   */
  togglable: false;
}

interface TogglableModule<N extends string> extends CommonModule<N> {
  /**
   * Whether this module can be enabled/disabled.
   */
  togglable: true;

  /**
   * Whether this module is enabled or disabled by default.
   */
  defaultEnabled: boolean;

  /**
   * Can only be enabled if these other modules are enabled.
   */
  dependsOn: string[];

  /**
   * On an existing installation, if no information about whether this
   * module is enabled or disabled is cached, infer whether it's enabled
   * based on the current installation's state.
   */
  inferEnabled?: (fs: Store, paths: Paths) => Promise<boolean | undefined>;
}

export type Module<N extends string = string> = UntoggleableModule<N> | TogglableModule<N>;

export type ModuleStatusCache<N extends string> = {
  get: (module: Module<N>, fs: Store, paths: Paths) => Promise<boolean | undefined>;
  set: (module: Module<N>, val: boolean, fs: Store, paths: Paths) => Promise<void>;
};

export async function promptModulesEnabled<N extends string>(modules: Module<N>[], io: IO): Promise<Record<N, boolean>> {
  const modulesEnabled: Record<string, boolean> = {};

  const advanced = await io.getParam<boolean>({
    name: 'advancedInstallation',
    type: 'confirm',
    initial: false,
    message: `Advanced Initialization ${condFormat(io.supportsAnsiColor, chalk.dim, '(fine-tune which features are enabled)')}`,
  });

  for (const m of modules) {
    const missingDeps = !m.togglable || m.dependsOn.some(dep => !modulesEnabled[dep]);
    if (!m.togglable) {
      modulesEnabled[m.name] = true;
    } else if (missingDeps) {
      modulesEnabled[m.name] = false;
    } else if (advanced) {
      // eslint-disable-next-line no-await-in-loop
      modulesEnabled[m.name] = await io.getParam<boolean>({
        name: `modules.${m.name}`,
        type: 'confirm',
        initial: m.defaultEnabled,
        message: m.shortDescription + (m.longDescription ? condFormat(io.supportsAnsiColor, chalk.dim, ` (${m.longDescription})`) : ''),
      });
    } else {
      modulesEnabled[m.name] = m.defaultEnabled;
    }
  }

  return modulesEnabled;
}

export async function currModulesEnabled<N extends string>(
  modules: Module<N>[],
  fs: Store,
  paths: Paths,
  cache?: ModuleStatusCache<N>,
): Promise<Record<N, boolean>> {
  const modulesEnabled: Record<string, boolean> = {};

  for (const m of modules) {
    if (m.togglable) {
      // eslint-disable-next-line no-await-in-loop
      const isEnabled = await cache?.get(m, fs, paths) ?? await m.inferEnabled?.(fs, paths);

      modulesEnabled[m.name] = isEnabled ?? m.defaultEnabled;
    } else {
      modulesEnabled[m.name] = true;
    }
  }

  return modulesEnabled;
}

export async function setModuleValue<MN extends string>(
  module: Module<MN>,
  enabled: boolean,
  fs: Store,
  paths: Paths,
  cache: ModuleStatusCache<MN>,
): Promise<void> {
  if (module.togglable) {
    cache.set(module, enabled, fs, paths);
  }
}

// eslint-disable-next-line max-params
export async function applyModule<MN extends string, TN extends string>(
  module: Module<MN>,
  modulesEnabled: Record<string, boolean>,
  paramVals: Record<TN, unknown>,
  scaffoldDir: string,
  fs: Store,
  paths: Paths,
  excludeFiles: string[] = [],
  isInitial = false,
): Promise<Store> {
  const fsEditor = create(fs);

  // Validate that module can be enabled
  if (!modulesEnabled?.[module.name]) {
    throw new Error(`Could not apply module "${module.name}", because it is not enabled in the provided module statuses.`);
  }

  // Validate that dependencies are enabled
  const missingDeps = module.togglable ? module.dependsOn.filter(dep => !modulesEnabled[dep]) : [];
  if (missingDeps.length > 0) {
    throw new Error(`Could not apply module "${module.name}", because the following dependency modules are missing: "${missingDeps.join(', ')}".`);
  }

  // Validate that all needed params are present
  const missingParams = module.needsTemplateParams.filter(p => !(p in paramVals));
  if (missingParams.length > 0) {
    throw new Error(`Could not apply module "${module.name}", because the following params are missing: "${missingParams.join(', ')}".`);
  }

  if (!isInitial && !module.updatable) {
    throw new Error(`Cannot update module "${module.name}", as it is not updatable, and has already been initialized.`);
  }

  const tplData = {
    params: paramVals,
    modules: modulesEnabled,
  };

  const tplDataFlat = { ...renameKeys(tplData.modules, k => `modules.${k}`), ...renameKeys(tplData.params, k => `params.${k}`) } as Record<string, string>;

  for (const file of module.filesToReplace) {
    const path = typeof file === 'string' ? file : file.path;
    const needsOtherModules = typeof file === 'string' ? [] : file.needsOtherModules ?? [];

    if (!excludeFiles.includes(path) && !needsOtherModules.some(dep => !modulesEnabled[dep])) {
      const copyToIfMonorepo = typeof file !== 'string' && file.monorepoPath ? paths.monorepo(cloneAndFill(file.monorepoPath, tplDataFlat)) : undefined;
      const copyTo = copyToIfMonorepo ?? paths.package(typeof file !== 'string' && file.destPath ? cloneAndFill(file.destPath, tplDataFlat) : path);
      fsEditor.copyTpl(resolve(scaffoldDir, path), copyTo, tplData);
    }
  }

  const jsonPaths = cloneAndFill(module.jsonToAugment, tplDataFlat);
  for (const jsonPath of Object.keys(jsonPaths)) {
    const scaffoldContents = readTpl(resolve(scaffoldDir, jsonPath), tplData);
    const scaffoldContentsJson = JSON.parse(scaffoldContents);

    const fieldsToAugment = jsonPaths[jsonPath];
    const relevant = pick(scaffoldContentsJson, fieldsToAugment);

    fsEditor.extendJSON(paths.package(jsonPath), relevant, undefined, 4);
  }

  return fs;
}
