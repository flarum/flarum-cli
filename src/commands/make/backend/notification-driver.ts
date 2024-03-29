import {PredefinedParameters, ShouldRunConfig, StepDependency, StepManager} from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../../providers';
import {GenerateNotificationDriverStub} from "../../../steps/stubs/backend/notification-driver";
import {GenerateNotificationDriverExtender} from "../../../steps/extenders/notification-driver";

export default class NotificationDriver extends BaseCommand {
  static description = 'Generate a notification driver class';

  static flags = { ...BaseCommand.flags };

  static args = [
    BaseCommand.classNameArg,
    ...BaseCommand.args
  ];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      NotificationDriver.steps(stepManager, this.STUB_PATH);
    });
  }

  public static steps(stepManager: StepManager<FlarumProviders>, STUB_PATH: string, shouldRun?: ShouldRunConfig, dependencies?: StepDependency[], predefinedDependencies?: PredefinedParameters): StepManager<FlarumProviders> {
    return stepManager
      .namedStep('driver', new GenerateNotificationDriverStub(STUB_PATH, genExtScaffolder()), shouldRun, dependencies, predefinedDependencies)
      .step(new GenerateNotificationDriverExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
        {
          sourceStep: 'driver',
          exposedName: 'class',
          consumedName: 'driverClass',
        },
      ]);
  }
}
