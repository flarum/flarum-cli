import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';
import s from 'string';
import { StubGenerationSchema } from 'boilersmith/steps/stub-base';
import { Answers } from 'prompts';

export class GenerateNotificationBlueprintStub extends BasePhpStubStep {
  type = 'Generate Notification Blueprint';

  additionalExposes = ['className', 'type'];

  protected schema: StubGenerationSchema = {
    recommendedSubdir: 'Notification',
    sourceFile: 'backend/notification-blueprint.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Notification blueprint class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'type',
        message: 'Notification type',
        type: 'text',
        initial: (_prev: string, params: Answers<string>): string => {
          return s(params.get('className') as string)
            .underscore()
            .camelize()
            .toString()
            .replace(/Blueprint$/, '');
        },
      },
    ],
  };
}
