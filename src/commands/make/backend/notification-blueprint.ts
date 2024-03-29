import {PredefinedParameters, ShouldRunConfig, StepDependency, StepManager} from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../../providers';
import { GenerateNotificationBlueprintStub } from '../../../steps/stubs/backend/notification-blueprint';
import { GenerateNotificationTypeExtender } from '../../../steps/extenders/notification-type';

export default class NotificationBlueprint extends BaseCommand {
  static description = 'Generate a notification blueprint class';

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
      NotificationBlueprint.steps(stepManager, this.STUB_PATH);
    });
  }

  public static steps(stepManager: StepManager<FlarumProviders>, STUB_PATH: string, shouldRun?: ShouldRunConfig, dependencies?: StepDependency[], predefinedDependencies?: PredefinedParameters): StepManager<FlarumProviders> {
    return stepManager
      .namedStep('blueprint', new GenerateNotificationBlueprintStub(STUB_PATH, genExtScaffolder()), shouldRun, dependencies, predefinedDependencies)
      .step(new GenerateNotificationTypeExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
        {
          sourceStep: 'blueprint',
          exposedName: 'class',
          consumedName: 'blueprintClass',
        },
      ]);
  }
}
