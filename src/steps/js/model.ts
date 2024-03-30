import { BaseJsStep } from './base';
import { ExtenderGenerationSchema } from '../extenders/base';
import { ExpressionType } from '../../providers/php-provider';
import { pluralKebabCaseModel } from '../../utils/model-name';
import { Answers } from 'prompts';

export class GenerateModelExtender extends BaseJsStep {
  type = 'Generate JS Model Extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: 'flarum/common/extenders/Store',
      },
      methodCalls: [
        {
          methodName: 'add',
          args: [
            {
              type: ExpressionType.SCALAR,
              value: '${modelType}',
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
      },
      {
        name: 'modelType',
        message: 'Model type',
        type: 'text',
        initial: (_prev: string, params: Answers<string>): string => {
          return pluralKebabCaseModel(params.get('className') as string);
        },
      },
    ],
  };

  protected async getDefinition(): Promise<null> {
    return Promise.resolve(null);
  }
}
