import { BaseJsStep } from './base';
import { ExtenderGenerationSchema } from '../extenders/base';
import { ExpressionType } from '../../providers/php-provider';
import { Validator } from '../../utils/validation';
import s from 'string';
import { Answers } from 'prompts';

export class GeneratePostTypeExtender extends BaseJsStep {
  type = 'Generate JS Post Type Extender';

  exposes = ['type'];

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: 'flarum/common/extenders/PostTypes',
      },
      methodCalls: [
        {
          methodName: 'add',
          args: [
            {
              type: ExpressionType.SCALAR,
              value: '${type}',
            },
            {
              type: ExpressionType.CLASS_CONST,
              value: '${className}',
            },
          ],
        },
      ],
    },
    params: [
      {
        name: 'className',
        message: 'Class name',
        type: 'text',
        validate: Validator.module,
      },
      {
        name: 'type',
        message: 'Post type',
        type: 'text',
        initial: (_prev: string, params: Answers<string>): string => {
          return s(params.get('className') as string)
            .camelize()
            .toString()
            .replace(/Post$/, '');
        },
      },
    ],
  };

  protected async getDefinition(): Promise<null> {
    return Promise.resolve(null);
  }
}
