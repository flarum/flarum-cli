import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import {GenerateNotificationStub} from "../../../steps/stubs/frontend/notification";
import {GenerateNotificationExtender} from "../../../steps/js/notification";
import s from "string";

export default class Notification extends BaseCommand {
  static description = 'Generate a frontend notification class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('notification', new GenerateNotificationStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateNotificationExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
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
            sourceStep: 'notification',
            exposedName: 'type',
            modifier: (value) => s(value as string).camelize().toString(),
          }
        ]);
    });
  }
}
