import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';
import {StubGenerationSchema} from "boilersmith/steps/stub-base";

export class GenerateNotificationDriverStub extends BasePhpStubStep {
  type = 'Generate Notification Driver';

  additionalExposes = ['className'];

  protected schema: StubGenerationSchema = {
    recommendedSubdir: 'Notification',
    sourceFile: 'backend/notification-driver.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Notification driver class name',
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
