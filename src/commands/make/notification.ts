import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../base-command';
import { FlarumProviders } from '../../providers';
import s from "string";
import FrontendNotification from "./frontend/notification";
import NotificationBlueprint from "./backend/notification-blueprint";

export default class Notification extends BaseCommand {
  static description = 'Generate a new notification';

  static flags = { ...BaseCommand.flags };

  static args = [
    BaseCommand.classNameArg,
    ...BaseCommand.args
  ];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      FrontendNotification.steps(NotificationBlueprint.steps(stepManager, this.STUB_PATH), this.STUB_PATH, {}, [
        {
          sourceStep: 'blueprint',
          exposedName: 'className',
          // Replace Blueprint with Notification
          modifier: (value) => (value as string).replace(/Blueprint$/, 'Notification'),
        },
        {
          sourceStep: 'blueprint',
          exposedName: 'type',
          modifier: (value) => s(value as string).underscore().toString().replace(/_notification$/, ''),
        }
      ]);
    });
  }
}
