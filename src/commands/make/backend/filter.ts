import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { GenerateFilterStub } from '../../../steps/stubs/backend/filter';
import { GenerateSearchFilterExtender } from '../../../steps/extenders/search-filter';

export default class Filter extends BaseCommand {
  static description = 'Generate a filter class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('filter', new GenerateFilterStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateSearchFilterExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
          {
            sourceStep: 'filter',
            exposedName: 'class',
            consumedName: 'filterClass',
          },
        ]);
    });
  }
}
