import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';

export class GenerateNotificationBlueprintStub extends BasePhpStubStep {
  type = 'Generate Notification Blueprint';

  protected schema = {
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
    ],
  };
}
