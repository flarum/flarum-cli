import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { BaseJsStep } from './base';
import { ExtenderGenerationSchema } from '../extenders/base';
import { ExpressionType } from '../../providers/php-provider';
import { Validator } from '../../utils/validation';

export class GenerateSearchGambitExtender extends BaseJsStep {
  type = 'Generate JS Gambit Extender';

  exposes = [];

  getExposed(_paths: Paths, _paramProvider: IO): Record<string, unknown> {
    return {};
  }

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: 'flarum/common/extenders/Search',
      },
      methodCalls: [
        {
          methodName: 'gambit',
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
        name: 'modelType',
        message: 'Type of the model (e.g. posts, users)',
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
