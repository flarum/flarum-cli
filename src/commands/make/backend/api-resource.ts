import { StepManager } from 'boilersmith/step-manager';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import BaseCommand from '../../../base-command';
import { GenerateApiResourceStub } from '../../../steps/stubs/backend/api-resource';

export default class ApiResource extends BaseCommand {
  static description = 'Generate an API resource class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.step(new GenerateApiResourceStub(this.STUB_PATH, genExtScaffolder()));
  }
}
