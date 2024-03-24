import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';

export class GenerateMiddlewareStub extends BasePhpStubStep {
  type = 'Generate a middleware class';

  protected additionalExposes = ['className'];

  protected phpClassParams = [];

  protected schema = {
    recommendedSubdir: 'Middleware',
    sourceFile: 'backend/middleware.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Middleware class name',
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
