import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';

export class GenerateSearchDriverStub extends BasePhpStubStep {
  type = 'Generate Search Driver';

  protected additionalExposes = ['driverName'];

  protected phpClassParams = [];

  protected schema = {
    recommendedSubdir: 'Search',
    sourceFile: 'backend/search/driver.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Driver class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'driverName',
        type: 'text',
        message: 'Unique driver name (e.g. extension-name-driver-name)',
        validate: Validator.alphaDash,
      }
    ],
  };
}
