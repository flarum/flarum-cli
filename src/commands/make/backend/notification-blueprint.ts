import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../../providers';
import { GenerateNotificationBlueprintStub } from '../../../steps/stubs/backend/notification-blueprint';
import { GenerateNotificationTypeExtender } from '../../../steps/extenders/notification-type';

export default class NotificationBlueprint extends BaseCommand {
  static description = 'Generate a notification blueprint class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('blueprint', new GenerateNotificationBlueprintStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateNotificationTypeExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
          {
            sourceStep: 'blueprint',
            exposedName: 'class',
            consumedName: 'blueprintClass',
          },
        ]);
    });
  }
}
