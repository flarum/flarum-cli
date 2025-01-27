import { StepManager } from 'boilersmith/step-manager';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import BaseCommand from '../../../base-command';
import { GenerateValidatorStub } from '../../../steps/stubs/backend/validator';

export default class Validator extends BaseCommand {
  static description = 'Generate a validator class';

  static flags = { ...BaseCommand.flags };

  static args = [BaseCommand.classNameArg, ...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.step(new GenerateValidatorStub(this.STUB_PATH, genExtScaffolder()));
  }
}
