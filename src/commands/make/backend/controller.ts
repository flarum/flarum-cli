import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { GenerateControllerStub } from '../../../steps/stubs/backend/controller';
import { GenerateRoutesExtender } from '../../../steps/extenders/route';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../../providers';

export default class Controller extends BaseCommand {
  static description = 'Generate a controller class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('controller', new GenerateControllerStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateRoutesExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
          {
            sourceStep: 'controller',
            exposedName: 'class',
            consumedName: 'routeHandler',
          },
          {
            sourceStep: 'controller',
            exposedName: 'frontend',
            consumedName: 'frontend',
          }
        ]);
    });
  }
}
