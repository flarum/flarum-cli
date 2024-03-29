import {PredefinedParameters, ShouldRunConfig, StepDependency, StepManager} from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../../providers';
import {GeneratePostTypeExtender} from "../../../steps/extenders/post-type";
import {GeneratePostTypeStub} from "../../../steps/stubs/backend/post-type";

export default class BackendPostType extends BaseCommand {
  static description = 'Generate a new backend post type class';

  static flags = { ...BaseCommand.flags };

  static args = [
    BaseCommand.classNameArg,
    ...BaseCommand.args
  ];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      BackendPostType.steps(stepManager, this.STUB_PATH);
    });
  }

  public static steps(stepManager: StepManager<FlarumProviders>, STUB_PATH: string, shouldRun?: ShouldRunConfig, dependencies?: StepDependency[], predefinedDependencies?: PredefinedParameters): StepManager<FlarumProviders> {
    return stepManager
      .namedStep('backendPostType', new GeneratePostTypeStub(STUB_PATH, genExtScaffolder()), shouldRun, dependencies, predefinedDependencies)
      .step(new GeneratePostTypeExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
        {
          sourceStep: 'backendPostType',
          exposedName: 'class',
          consumedName: 'postClass',
        },
      ]);
  }
}
