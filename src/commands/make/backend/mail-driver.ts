import { PredefinedParameters, ShouldRunConfig, StepDependency, StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../../providers';
import { GenerateMailDriverStub } from '../../../steps/stubs/backend/mail-driver';
import { GenerateMailDriverExtender } from '../../../steps/extenders/mail-driver';

export default class MailDriver extends BaseCommand {
  static description = 'Generate a mail driver class';

  static flags = { ...BaseCommand.flags };

  static args = [BaseCommand.classNameArg, ...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      MailDriver.steps(stepManager, this.STUB_PATH);
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
      .namedStep('driver', new GenerateMailDriverStub(STUB_PATH, genExtScaffolder()), shouldRun, dependencies, predefinedDependencies)
      .step(new GenerateMailDriverExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
        {
          sourceStep: 'driver',
          exposedName: 'class',
          consumedName: 'driverClass',
        },
      ]);
  }
}
