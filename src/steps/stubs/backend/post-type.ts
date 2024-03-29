import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';
import {StubGenerationSchema} from "boilersmith/steps/stub-base";
import s from "string";

export class GeneratePostTypeStub extends BasePhpStubStep {
  type = 'Generate Event Post class';

  additionalExposes = ['className', 'postType'];

  protected schema: StubGenerationSchema = {
    recommendedSubdir: 'Post',
    sourceFile: 'backend/post-type.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Post class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'postType',
        type: 'text',
        message: 'Post type',
        initial: (_prev, params): string => {
          return s((params.get('className') as string)).underscore().camelize().toString().replace(/Post$/, '');
        }
      }
    ],
  };
}
