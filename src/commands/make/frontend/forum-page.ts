import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { GenerateForumPageStub } from '../../../steps/stubs/frontend/forum-page';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import {GenerateRoutesExtender} from "../../../steps/js/routes";

export default class ForumPage extends BaseCommand {
  static description = 'Generate a forum page class';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager.namedStep('forumPage', new GenerateForumPageStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateRoutesExtender(), { optional: true, confirmationMessage: 'Generate corresponding route extender?', default: true }, [
          {
            sourceStep: 'forumPage',
            exposedName: 'frontend',
          },
          {
            sourceStep: 'forumPage',
            exposedName: 'classNamespace',
            consumedName: 'className',
            modifier: (pathWithFrontend) => (pathWithFrontend as string).replace(/^[^/]+/, '.'),
          },
        ]);
    });
  }
}
