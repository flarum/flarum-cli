import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { GenerateMiddlewareStub } from '../../../steps/stubs/backend/middleware';
import { GenerateMiddlewareExtender } from '../../../steps/extenders/middleware';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';

export default class Middleware extends BaseCommand {
  static description = 'Generate a middleware';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('middleware', new GenerateMiddlewareStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateMiddlewareExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
          {
            sourceStep: 'middleware',
            exposedName: 'class',
            consumedName: 'middlewareClass',
          },
        ]);
    });
  }
}
