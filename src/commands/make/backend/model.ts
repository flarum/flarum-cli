/* eslint-disable no-warning-comments */
import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { GenerateModelStub } from '../../../steps/stubs/backend/model';
import { GenerateMigrationStub } from '../../../steps/stubs/backend/migration';
import { GenerateApiResourceStub } from '../../../steps/stubs/backend/api-resource';
import { GeneratePolicyStub } from '../../../steps/stubs/backend/policy';
import { GeneratePolicyExtender } from '../../../steps/extenders/policy';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';

export default class Model extends BaseCommand {
  static description = 'Generate a model class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('model', new GenerateModelStub(this.STUB_PATH, genExtScaffolder()))
        .step(
          new GenerateMigrationStub(this.STUB_PATH, genExtScaffolder()),
          {optional: true, confirmationMessage: 'Generate corresponding Migration?', default: true},
          [
            {
              sourceStep: 'model',
              exposedName: 'migrationName',
              consumedName: 'name',
            },
          ]
        )
        .namedStep(
          'resource',
          new GenerateApiResourceStub(this.STUB_PATH, genExtScaffolder()),
          {optional: true, confirmationMessage: 'Generate corresponding API Resource?', default: true},
          [
            {
              sourceStep: 'model',
              exposedName: 'class',
              consumedName: 'modelClass',
            },
            {
              sourceStep: 'model',
              exposedName: 'className',
              consumedName: 'className',
              modifier: (modelClassName: unknown) => `${modelClassName as string}Resource`,
            },
          ]
        )
        .namedStep(
          'policy',
          new GeneratePolicyStub(this.STUB_PATH, genExtScaffolder()),
          {optional: true, confirmationMessage: 'Generate corresponding Policy?', default: true},
          [
            {
              sourceStep: 'model',
              exposedName: 'class',
              consumedName: 'modelClass',
            },
            {
              sourceStep: 'model',
              exposedName: 'className',
              consumedName: 'className',
              modifier: (modelClassName: unknown) => `${modelClassName as string}Policy`,
            },
          ]
        )
        .step(new GeneratePolicyExtender(), {}, [
          {
            sourceStep: 'policy',
            exposedName: '__succeeded',
          },
          {
            sourceStep: 'policy',
            exposedName: 'class',
            consumedName: 'policyClass',
          },
          {
            sourceStep: 'policy',
            exposedName: 'modelClass',
          },
        ]);
    });
  }
}
