import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { BaseJsStep } from './base';
import { ExtenderGenerationSchema } from '../extenders/base';
import { ExpressionType } from '../../providers/php-provider';
import { Validator } from '../../utils/validation';
import s from "string";

export class GenerateNotificationExtender extends BaseJsStep {
  type = 'Generate JS Notification Extender';

  exposes = [];

  getExposed(_paths: Paths, _paramProvider: IO): Record<string, unknown> {
    return {};
  }

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: 'flarum/common/extenders/Notification',
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
        message: 'Notification type',
        type: 'text',
        initial: (_prev, params): string => {
          return s(params.get('className') as string).camelize().toString();
        }
      },
    ],
  };

  protected async getDefinition(): Promise<null> {
    return Promise.resolve(null);
  }
}
