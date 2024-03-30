import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../base-command';
import { FlarumProviders } from '../../providers';
import BackendModel from './backend/model';
import FrontendModel from './frontend/model';
import * as Interfaces from '@oclif/core/lib/interfaces';

export default class Model extends BaseCommand {
  static description = 'Generate a model class';

  static flags = { ...BaseCommand.flags };

  static args: Interfaces.ArgInput = [BaseCommand.classNameArg, ...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      FrontendModel.steps(
        BackendModel.steps(stepManager, this.STUB_PATH),
        this.STUB_PATH,
        {},
        [
          {
            sourceStep: 'backendModel',
            exposedName: 'className',
          },
          {
            sourceStep: 'api-resource',
            exposedName: 'modelType',
            promptWhenMissing: true,
          },
        ],
        {
          frontend: 'common',
        }
      );
    });
  }
}
