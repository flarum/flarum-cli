import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { GenerateForumPageStub } from '../../../steps/stubs/frontend/forum-page';
import { FlarumProviders } from '../../../providers';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { GenerateRoutesExtender } from '../../../steps/js/routes';
import {LocaleStep} from "../../../steps/locale/base";
import s from "string";
import {kebab} from "../../../utils/model-name";

export default class ForumPage extends BaseCommand {
  static description = 'Generate a forum page class';

  static flags = { ...BaseCommand.flags };

  static args = [
    BaseCommand.classNameArg,
    {
      name: 'routeName',
      description: 'Route name (unique)',
      required: false,
    },
    {
      name: 'routePath',
      description: 'Route path',
      required: false,
    },
    ...BaseCommand.args
  ];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('forumPage', new GenerateForumPageStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateRoutesExtender(), { optional: true, confirmationMessage: 'Generate corresponding route extender?', default: true }, [
          {
            sourceStep: 'forumPage',
            exposedName: 'frontend',
          },
          {
            sourceStep: 'forumPage',
            exposedName: 'classNamespace',
            consumedName: 'className',
          },
        ])
        .step(new LocaleStep(genExtScaffolder()), {}, [
          {
            sourceStep: 'forumPage',
            exposedName: 'className',
            consumedName: 'key',
            modifier: (className) => `forum.${kebab(className as string)}.title`
          },
          {
            sourceStep: 'forumPage',
            exposedName: 'className',
            consumedName: 'value',
            modifier: (className) => s(className as string).humanize().titleCase().s
          },
        ])
        .step(new LocaleStep(genExtScaffolder()), {}, [
          {
            sourceStep: 'forumPage',
            exposedName: 'className',
            consumedName: 'key',
            modifier: (className) => `forum.${kebab(className as string)}.content`
          },
        ], {
          value: 'Hello, world!'
        })
        .step(new LocaleStep(genExtScaffolder()), {}, [
          {
            sourceStep: 'forumPage',
            exposedName: 'className',
            consumedName: 'key',
            modifier: (className) => `forum.${kebab(className as string)}.hero.title`
          },
        ], {
          value: 'Hero title',
        })
        .step(new LocaleStep(genExtScaffolder()), {}, [
          {
            sourceStep: 'forumPage',
            exposedName: 'className',
            consumedName: 'key',
            modifier: (className) => `forum.${kebab(className as string)}.hero.subtitle`
          },
        ], {
          value: 'Hero subtitle',
        });
    });
  }
}
