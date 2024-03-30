import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';
import { StubGenerationSchema } from 'boilersmith/steps/stub-base';
import s from 'string';
import { Answers } from 'prompts';

export class GenerateSearchDriverStub extends BasePhpStubStep {
  type = 'Generate Search Driver';

  protected additionalExposes = ['driverName'];

  protected phpClassParams = [];

  protected schema: StubGenerationSchema = {
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
        initial: (_prev: string, params: Answers<string>): string => {
          const extensionId = params.get('extensionId') as string;
          const driverName = s(params.get('className') as string)
            .underscore()
            .dasherize()
            .toString()
            .replace(/-search-driver$/, '')
            .replace(/-driver$/, '');

          return `${extensionId}-${driverName}`;
        },
      },
    ],
  };
}
