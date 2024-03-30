import { BaseJsStep } from './base';
import { ExtenderGenerationSchema } from '../extenders/base';
import { ExpressionType } from '../../providers/php-provider';
import { Validator } from '../../utils/validation';
import chalk from 'chalk';

export class GenerateRoutesExtender extends BaseJsStep {
  type = 'Generate JS Model Extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: 'flarum/common/extenders/Routes',
      },
      methodCalls: [
        {
          methodName: 'add',
          args: [
            {
              type: ExpressionType.SCALAR,
              value: '${routeName}',
            },
            {
              type: ExpressionType.SCALAR,
              value: '${routePath}',
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
        name: 'routeName',
        message: 'Route name (unique)',
        type: 'text',
        validate: Validator.routeName,
      },
      {
        name: 'routePath',
        message: `Route Path (${chalk.dim('/pathName')})`,
        type: 'text',
      },
      {
        name: 'className',
        message: 'Class name',
        type: 'text',
        validate: Validator.module,
      },
    ],
  };

  protected async getDefinition(): Promise<null> {
    return Promise.resolve(null);
  }
}
