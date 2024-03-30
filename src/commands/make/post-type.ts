import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../base-command';
import { FlarumProviders } from '../../providers';
import s from 'string';
import FrontendPostType from './frontend/post-type';
import BackendPostType from './backend/post-type';

export default class Notification extends BaseCommand {
  static description = 'Generate a new post type';

  static flags = { ...BaseCommand.flags };

  static args = [BaseCommand.classNameArg, ...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      FrontendPostType.steps(BackendPostType.steps(stepManager, this.STUB_PATH), this.STUB_PATH, {}, [
        {
          sourceStep: 'backendPostType',
          exposedName: 'className',
        },
        {
          sourceStep: 'backendPostType',
          exposedName: 'postType',
          modifier: (value) =>
            s(value as string)
              .underscore()
              .toString()
              .replace(/_notification$/, ''),
        },
      ]);
    });
  }
}
