import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';

export class GenerateControllerStub extends BasePhpStubStep {
  type = 'Generate Controller Class';

  protected additionalExposes = ['frontend'];

  protected phpClassParams = [];

  protected schema = {
    recommendedSubdir: 'Controller',
    sourceFile: 'backend/controller.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Controller class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'frontend',
        type: 'autocomplete',
        message: 'Controller type/frontend',
        choices: ['forum', 'admin', 'api'].map((type: string) => ({
          title: type,
          value: type.toLowerCase(),
        })),
      },
    ],
  };
}
