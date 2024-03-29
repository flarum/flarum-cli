import {PredefinedParameters, ShouldRunConfig, StepDependency, StepManager} from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import s from "string";
import {GeneratePostTypeStub} from "../../../steps/stubs/frontend/post-type";
import {GeneratePostTypeExtender} from "../../../steps/js/post-type";

export default class FrontendPostType extends BaseCommand {
  static description = 'Generate a frontend post type class';

  static flags = { ...BaseCommand.flags };

  static args = [
    {
      name: 'className',
      description: 'The name of the class to generate',
      required: false,
    },
    ...BaseCommand.args
  ];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      FrontendPostType.steps(stepManager, this.STUB_PATH);
    });
  }

  public static steps(stepManager: StepManager<FlarumProviders>, STUB_PATH: string, shouldRun?: ShouldRunConfig, dependencies?: StepDependency[], predefinedDependencies?: PredefinedParameters): StepManager<FlarumProviders> {
    return stepManager
      .namedStep('frontendPostType', new GeneratePostTypeStub(STUB_PATH, genExtScaffolder()), shouldRun, dependencies, predefinedDependencies)
      .step(new GeneratePostTypeExtender(), { optional: true, confirmationMessage: 'Generate corresponding frontend extender?', default: true }, [
        {
          sourceStep: 'frontendPostType',
          exposedName: 'frontend',
        },
        {
          sourceStep: 'frontendPostType',
          exposedName: 'classNamespace',
          consumedName: 'className',
        },
        {
          sourceStep: 'frontendPostType',
          exposedName: 'postType',
          consumedName: 'type',
          modifier: (value) => s(value as string).underscore().camelize().toString(),
        }
      ]);
  }
}
