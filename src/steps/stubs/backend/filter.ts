import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';
import { StubGenerationSchema } from 'boilersmith/steps/stub-base';
import s from 'string';
import { Answers } from 'prompts';

export class GenerateFilterStub extends BasePhpStubStep {
  type = 'Generate a filter Class';

  protected additionalExposes = ['filterClass'];

  phpClassParams = ['filterClass'];

  protected schema: StubGenerationSchema = {
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
        initial: (_prev: string, params: Answers<string>): string =>
          s(params.get('className') as string)
            .underscore()
            .camelize()
            .toString()
            .replace(/Filter$/, ''),
      },
    ],
  };
}
