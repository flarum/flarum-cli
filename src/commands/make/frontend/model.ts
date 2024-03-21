import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { GenerateModelStub } from '../../../steps/stubs/frontend/model';
import { GenerateModelExtender } from '../../../steps/js/model';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';

export default class Model extends BaseCommand {
  static description = 'Generate a model class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager.namedStep('model', new GenerateModelStub(this.STUB_PATH, genExtScaffolder())).step(new GenerateModelExtender(), {}, [
        {
          sourceStep: 'model',
          exposedName: 'frontend',
        },
        {
          sourceStep: 'model',
          exposedName: 'classNamespace',
          consumedName: 'className',
        },
        {
          sourceStep: 'model',
          exposedName: 'modelType',
        },
      ]);
    });
  }
}
