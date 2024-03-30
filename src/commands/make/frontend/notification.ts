import { PredefinedParameters, ShouldRunConfig, StepDependency, StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { GenerateNotificationStub } from '../../../steps/stubs/frontend/notification';
import { GenerateNotificationExtender } from '../../../steps/js/notification';
import s from 'string';
import { LocaleStep } from '../../../steps/locale/base';

export default class FrontendNotification extends BaseCommand {
  static description = 'Generate a frontend notification class';

  static flags = { ...BaseCommand.flags };

  static args = [BaseCommand.classNameArg, ...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      FrontendNotification.steps(stepManager, this.STUB_PATH);
    });
  }

  public static steps(
    stepManager: StepManager<FlarumProviders>,
    STUB_PATH: string,
    shouldRun?: ShouldRunConfig,
    dependencies?: StepDependency[],
    predefinedDependencies?: PredefinedParameters
  ): StepManager<FlarumProviders> {
    return stepManager
      .namedStep('notification', new GenerateNotificationStub(STUB_PATH, genExtScaffolder()), shouldRun, dependencies, predefinedDependencies)
      .step(new GenerateNotificationExtender(), { optional: true, confirmationMessage: 'Generate corresponding frontend extender?', default: true }, [
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
          modifier: (value) =>
            s(value as string)
              .underscore()
              .camelize()
              .toString(),
        },
      ])
      .step(new LocaleStep(genExtScaffolder()), {}, [
        {
          sourceStep: 'notification',
          exposedName: 'type',
          consumedName: 'key',
          modifier: (type) =>
            `forum.notifications.${s(type as string)
              .underscore()
              .toString()}_text`,
        },
        {
          sourceStep: 'notification',
          exposedName: 'type',
          consumedName: 'value',
          modifier: (type) =>
            `${s(type as string)
              .humanize()
              .titleCase()
              .toString()} notification from {user}`,
        },
      ]);
  }
}
