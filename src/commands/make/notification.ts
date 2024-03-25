import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../base-command';
import { genExtScaffolder } from '../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../providers';
import { GenerateNotificationBlueprintStub } from '../../steps/stubs/backend/notification-blueprint';
import { GenerateNotificationTypeExtender } from '../../steps/extenders/notification-type';
import {GenerateNotificationStub} from "../../steps/stubs/frontend/notification";
import {GenerateNotificationExtender} from "../../steps/js/notification";
import s from "string";

export default class NotificationBlueprint extends BaseCommand {
  static description = 'Generate a new notification';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('blueprint', new GenerateNotificationBlueprintStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateNotificationTypeExtender(), {}, [
          {
            sourceStep: 'blueprint',
            exposedName: 'class',
            consumedName: 'blueprintClass',
          },
        ])
        .namedStep('notification', new GenerateNotificationStub(this.STUB_PATH, genExtScaffolder()), {}, [
          {
            sourceStep: 'blueprint',
            exposedName: 'className',
            // Replace Blueprint with Notification
            modifier: (value) => (value as string).replace(/Blueprint$/, 'Notification'),
          },
          {
            sourceStep: 'blueprint',
            exposedName: 'type',
            modifier: (value) => s(value as string).underscore().toString().replace('_notification', ''),
          }
        ])
        .step(new GenerateNotificationExtender(), {}, [
          {
            sourceStep: 'notification',
            exposedName: 'frontend',
          },
          {
            sourceStep: 'notification',
            exposedName: 'classNamespace',
            consumedName: 'className',
          },
          {
            sourceStep: 'blueprint',
            exposedName: 'type',
            modifier: (value) => s(value as string).underscore().camelize().toString(),
          }
        ]);
    });
  }
}
