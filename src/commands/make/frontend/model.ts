import {PredefinedParameters, ShouldRunConfig, StepDependency, StepManager} from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { GenerateModelStub } from '../../../steps/stubs/frontend/model';
import { GenerateModelExtender } from '../../../steps/js/model';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import * as Interfaces from "@oclif/core/lib/interfaces";

export default class FrontendModel extends BaseCommand {
  static description = 'Generate a model class';

  static flags = { ...BaseCommand.flags };

  static args: Interfaces.ArgInput = [
    {
      name: 'className',
      description: 'The name of the class to generate',
      required: false,
    },
    ...BaseCommand.args,
  ];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      FrontendModel.steps(stepManager, this.STUB_PATH);
    });
  }

  public static steps(stepManager: StepManager<FlarumProviders>, STUB_PATH: string, shouldRun?: ShouldRunConfig, dependencies?: StepDependency[], predefinedDependencies?: PredefinedParameters): StepManager<FlarumProviders> {
    return stepManager
      .namedStep('frontendModel', new GenerateModelStub(STUB_PATH, genExtScaffolder()), shouldRun, dependencies, predefinedDependencies)
      .step(new GenerateModelExtender(), { optional: true, confirmationMessage: 'Generate corresponding frontend extender?', default: true }, [
        {
          sourceStep: 'frontendModel',
          exposedName: 'frontend',
        },
        {
          sourceStep: 'frontendModel',
          exposedName: 'classNamespace',
          consumedName: 'className',
        },
        {
          sourceStep: 'frontendModel',
          exposedName: 'modelType',
        },
      ]);
  }
}
