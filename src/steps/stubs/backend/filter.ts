import chalk from 'chalk';
import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';

export class GenerateFilterStub extends BasePhpStubStep {
  type = 'Generate a filter Class';

  protected additionalExposes = ['filterClass'];

  phpClassParams = ['filterClass'];

  protected schema = {
    recommendedSubdir: 'Search',
    sourceFile: 'backend/filter.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Filter class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'filterKey',
        type: 'text',
        message: 'Filter key',
        validate: Validator.alphaNumeric,
      },
    ],
  };
}
