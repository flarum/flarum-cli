import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { GenerateGambitStub } from '../../../steps/stubs/frontend/gambit';
import { GenerateSearchGambitExtender } from '../../../steps/js/search-gambit';

export default class Gambit extends BaseCommand {
  static description = 'Generate a frontend gambit class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('gambit', new GenerateGambitStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateSearchGambitExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
          {
            sourceStep: 'gambit',
            exposedName: 'frontend',
          },
          {
            sourceStep: 'gambit',
            exposedName: 'classNamespace',
            consumedName: 'className',
          },
        ]);
    });
  }
}
