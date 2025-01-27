/* eslint-disable no-await-in-loop */
import { create as createMemFs, Store } from 'mem-fs';
import { ExposedParamManager } from './exposed-param-manager';
import { IO, Message } from './io';
import { Paths } from './paths';
import { commitAsync } from './utils/commit-async';

// eslint-disable-next-line @typescript-eslint/ban-types
export type DefaultProviders = {};

export interface Step<Providers extends DefaultProviders = DefaultProviders, Exposes extends string = string> {
  /**
   * A short string describing what the step does.
   */
  type: string;

  /**
   * Can this step be composed with other steps?
   *
   * This is the case if the step makes no changes to the disk filesystem while running.
   */
  composable: boolean;

  /**
   * A list of names of params that this step exposes to other steps.
   */
  exposes: Exposes[];

  run: (fs: Store, paths: Paths, io: IO, providers: Providers) => Promise<Store>;

  /**
   * Return an object of exposed params.
   *
   * The paths and io will be the same objects provided to the `run` method.
   */
  getExposed(paths: Paths, io: IO): Record<Exposes, unknown>;
}

export interface ShouldRunConfig {
  optional?: boolean;
  confirmationMessage?: string;
  default?: boolean;
  silent?: boolean;
}

export interface StoredStep<Providers extends DefaultProviders> {
  name?: string;
  step: Step<Providers>;
  shouldRun: ShouldRunConfig;
  dependencies: StepDependency[];
  predefinedParams: PredefinedParameters;
  mapPaths: string[];
}

export interface StepDependency {
  sourceStep: string;
  exposedName: string;
  consumedName?: string;
  dontRunIfFalsy?: boolean;
  promptWhenMissing?: boolean;
  modifier?: (value: unknown) => string;
}

export type PredefinedParameters = Record<string, unknown>;

type StepsResult =
  | {
      succeeded: true;
      messages: Message[];
      stepsRan: string[];
    }
  | {
      succeeded: false;
      error: string;
      errorTrace?: string;
      messages: Message[];
      stepsRan: string[];
      e?: any;
    };

const formatDependencies = (strings: string[]) => strings.map((s) => `"${s}"`).join(', ');

export class StepManager<Providers extends DefaultProviders> {
  protected steps: Array<StoredStep<Providers> | AtomicStepManager<Providers>> = [];

  protected namedSteps = new Map<string, StoredStep<Providers>>();

  protected exposedParams = new ExposedParamManager();

  private silent = false;

  /**
   * A step is an incremental operation that updates the filesystem.
   */
  step(
    step: Step<Providers>,
    shouldRun: ShouldRunConfig = {},
    dependencies: StepDependency[] = [],
    predefinedParams: PredefinedParameters = {},
    mapPaths: string[] = []
  ): this {
    this.validateDependencies(step, dependencies, mapPaths);

    if (!shouldRun.silent) {
      shouldRun.silent = this.silent;
      shouldRun.confirmationMessage = this.silent ? undefined : shouldRun.confirmationMessage;
      shouldRun.optional = this.silent ? false : shouldRun.optional;
      shouldRun.default = this.silent ? true : shouldRun.default;
    }

    this.steps = [...this.steps, { step, shouldRun, dependencies, predefinedParams, mapPaths }];

    return this;
  }

  namedStep(
    name: string,
    step: Step<Providers>,
    shouldRun: ShouldRunConfig = {},
    dependencies: StepDependency[] = [],
    predefinedParams: PredefinedParameters = {},
    mapPaths: string[] = []
  ): this {
    if (this.namedSteps.has(name)) {
      throw new Error(`Named steps must have unique names. A step with name "${name}" already exists.`);
    }

    this.validateDependencies(step, dependencies, mapPaths);

    if (!shouldRun.silent) {
      shouldRun.silent = this.silent;
      shouldRun.confirmationMessage = this.silent ? undefined : shouldRun.confirmationMessage;
      shouldRun.optional = this.silent ? false : shouldRun.optional;
      shouldRun.default = this.silent ? true : shouldRun.default;
    }

    const newStep = { name, step, shouldRun, dependencies, predefinedParams, mapPaths };

    this.steps = [...this.steps, newStep];

    this.namedSteps.set(name, newStep);

    return this;
  }

  atomicGroup(callback: (stepManager: AtomicStepManager<Providers>) => void): this {
    const atomicCollection = new AtomicStepManager(this.namedSteps, this.exposedParams);

    callback(atomicCollection);

    this.steps = [...this.steps, atomicCollection];

    return this;
  }

  silentGroup(callback: (stepManager: StepManager<Providers>) => void): this {
    this.silent = true;

    callback(this);

    this.silent = false;

    return this;
  }

  protected validateDependencies(step: Step<Providers>, dependencies: StepDependency[], mapPaths: string[]): void {
    const missingDependencySteps = dependencies.map((dep) => dep.sourceStep).filter((stepName) => !this.namedSteps.has(stepName));

    if (missingDependencySteps.length > 0) {
      throw new Error(`Step of type "${step.type}" depends on nonexistent named steps ${formatDependencies(missingDependencySteps)}`);
    }

    const missingDependencyParams: string[] = [];
    const missingDependencyParamSteps: string[] = [];

    for (const dependency of dependencies) {
      const sourceStep = this.namedSteps.get(dependency.sourceStep);

      if (!sourceStep?.step.exposes.includes(dependency.exposedName) && dependency.exposedName !== '__succeeded') {
        missingDependencyParamSteps.push(sourceStep?.name as string);
        missingDependencyParams.push(dependency.exposedName);
      }

      if (mapPaths.length === 0 && sourceStep?.mapPaths.length) {
        throw new Error(`Non path-mapped step of type "${step.type}" may not depend on path-mapped step "${sourceStep?.name}".`);
      }

      const missingMapPathsDeps = mapPaths.filter((p) => sourceStep && !sourceStep.mapPaths.includes(p));
      if (sourceStep && missingMapPathsDeps?.length && sourceStep.mapPaths.length > 0) {
        throw new Error(
          `Step of type "${step.type}" (A) depends on named step: "${
            sourceStep.name
          }" (B), but is mapped across some paths that (B) is not: "${missingMapPathsDeps.join(', ')}"`
        );
      }
    }

    if (missingDependencyParamSteps.length > 0) {
      throw new Error(
        `Step of type "${step.type}" depends on nonexistent exposed params ${formatDependencies(
          missingDependencyParams
        )} from named steps ${formatDependencies(missingDependencyParamSteps)}`
      );
    }
  }

  async run(paths: Paths, io: IO, providers: Providers, dry = false, args: Record<string, unknown> = {}): Promise<StepsResult> {
    if (dry && this.steps.some((s) => !(s instanceof AtomicStepManager) && !s.step.composable)) {
      throw new Error('Cannot dry run, as this step manager has non-composable steps.');
    }

    const stepNames: string[] = [];

    const checkAndRun = async (step: StoredStep<Providers>, packagePath?: string) => {
      const shouldRun: boolean = await this.stepShouldRun(step, io, packagePath);
      if (!shouldRun) return;

      const fs = await this.runStep(step, paths, io, providers, packagePath, undefined, args);

      if (!dry) {
        await commitAsync(fs);
      }

      stepNames.push(packagePath ? `${step.step.type} (${packagePath})` : step.step.type);
    };

    try {
      for (const storedStep of this.steps) {
        if (storedStep instanceof AtomicStepManager) {
          const res = await storedStep.run(paths, io, providers, false, args);
          if (!res.succeeded) {
            throw new Error(JSON.stringify(res));
          }

          stepNames.push(...res.stepsRan);
        } else if (storedStep.mapPaths.length > 0) {
          for (const path of storedStep.mapPaths) {
            await checkAndRun(storedStep, path);
          }
        } else {
          await checkAndRun(storedStep);
        }
      }
    } catch (error) {
      return {
        succeeded: false,
        error: error instanceof Error ? error.message : String(error),
        errorTrace: error instanceof Error ? error.stack : undefined,
        stepsRan: stepNames,
        messages: io.getOutput(),
        e: error,
      };
    }

    return {
      succeeded: true,
      stepsRan: stepNames,
      messages: io.getOutput(),
    };
  }

  protected async stepShouldRun(storedStep: StoredStep<Providers>, io: IO, packagePath?: string): Promise<boolean> {
    let allDependenciesRan = true;
    let noRequiredNonFalsyDependenciesAreFalsy = true;

    for (const dep of storedStep.dependencies) {
      const sourceStep = this.namedSteps.get(dep.sourceStep);
      const sourcePackagePath = sourceStep?.mapPaths.length ? packagePath : undefined;

      if (!this.exposedParams.stepRan(dep.sourceStep, sourcePackagePath) && !dep.promptWhenMissing) allDependenciesRan = false;

      if (dep.exposedName !== '__succeeded' && dep.dontRunIfFalsy && !this.exposedParams.get(dep.sourceStep, dep.exposedName, sourcePackagePath)) {
        noRequiredNonFalsyDependenciesAreFalsy = false;
      }
    }

    if (!allDependenciesRan || !noRequiredNonFalsyDependenciesAreFalsy) return false;

    if (!storedStep.shouldRun.optional) return true;

    const promptConfirm = await io.newInstance({ context: 'Confirm Step' }, []).getParam({
      name: 'execute_step',
      message: storedStep.shouldRun.confirmationMessage || `Run step of type "${storedStep.step.type}"?`,
      initial: storedStep.shouldRun.default || false,
      type: 'confirm',
    });

    return promptConfirm;
  }

  protected async runStep(
    storedStep: StoredStep<Providers>,
    paths: Paths,
    io: IO,
    providers: Providers,
    packagePath?: string,
    fs: Store = createMemFs(),
    args: Record<string, unknown> = {}
  ): Promise<Store> {
    const cached: Record<string, unknown> = {};

    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) {
        cached[key] = value;
      }
    });

    const initial: Record<string, unknown> = storedStep.dependencies.reduce((initial, dep) => {
      const sourceStep = this.namedSteps.get(dep.sourceStep);

      let depValue;
      depValue =
        dep.exposedName === '__succeeded'
          ? this.exposedParams.stepRan(dep.sourceStep, packagePath)
          : this.exposedParams.get(dep.sourceStep, dep.exposedName, sourceStep?.mapPaths.length ? packagePath : undefined);

      if (dep.modifier) {
        depValue = dep.modifier(depValue);
      }

      initial[dep.consumedName || dep.exposedName] = depValue;

      return initial;
    }, cached);

    const cloned = io.newInstance({ ...initial, ...storedStep.predefinedParams }, io.getOutput());

    const stepPaths = packagePath ? paths.onMonorepoSub(packagePath) : paths;
    const newFs = await storedStep.step.run(fs, stepPaths, cloned, providers);

    if (storedStep.name) {
      this.exposedParams.add(storedStep.name, storedStep.step.getExposed(stepPaths, io), packagePath);
    }

    return newFs;
  }
}

export class AtomicStepManager<Providers extends DefaultProviders> extends StepManager<Providers> {
  protected steps: StoredStep<Providers>[] = [];

  constructor(
    parentNamedSteps: Map<string, StoredStep<Providers>> = new Map(),
    parentExposedParams: ExposedParamManager = new ExposedParamManager()
  ) {
    super();
    this.namedSteps = parentNamedSteps;
    this.exposedParams = parentExposedParams;
  }

  step(
    step: Step<Providers>,
    shouldRun: ShouldRunConfig = {},
    dependencies: StepDependency[] = [],
    predefinedParams: PredefinedParameters = {},
    mapPaths: string[] = []
  ): this {
    if (!step.composable) {
      throw new Error(`Step of type "${step.type}" is not composable, and cannot be added to an atomic group.`);
    }

    return super.step(step, shouldRun, dependencies, predefinedParams, mapPaths);
  }

  namedStep(
    name: string,
    step: Step<Providers>,
    shouldRun: ShouldRunConfig = {},
    dependencies: StepDependency[] = [],
    predefinedParams: PredefinedParameters = {},
    mapPaths: string[] = []
  ): this {
    if (!step.composable) {
      throw new Error(`Step of type "${step.type}" is not composable, and cannot be added to an atomic group.`);
    }

    return super.namedStep(name, step, shouldRun, dependencies, predefinedParams, mapPaths);
  }

  atomicGroup(_callback: (stepManager: AtomicStepManager<Providers>) => void): this {
    throw new Error("Atomic groups can't be nested.");
  }

  async run(paths: Paths, io: IO, providers: Providers, dry = false, args: Record<string, unknown> = {}): Promise<StepsResult> {
    let fs = createMemFs();

    const checkAndRun = async (step: StoredStep<Providers>, packagePath?: string) => {
      const shouldRun: boolean = await this.stepShouldRun(step, io, packagePath);
      if (!shouldRun) return;

      fs = await this.runStep(step, paths, io, providers, packagePath, fs, args);

      stepNames.push(packagePath ? `${step.step.type} (${packagePath})` : step.step.type);
    };

    const stepNames: string[] = [];

    try {
      for (const storedStep of this.steps) {
        if (storedStep.mapPaths.length > 0) {
          for (const path of storedStep.mapPaths) {
            await checkAndRun(storedStep, path);
          }
        } else {
          await checkAndRun(storedStep);
        }
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
        errorTrace: error instanceof Error ? error.stack : undefined,
        succeeded: false,
        stepsRan: [],
        messages: io.getOutput(),
      };
    }

    if (!dry) {
      await commitAsync(fs);
    }

    return {
      succeeded: true,
      stepsRan: stepNames,
      messages: io.getOutput(),
    };
  }
}
