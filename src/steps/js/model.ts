import {IO} from 'boilersmith/io';
import {Paths} from 'boilersmith/paths';
import {BaseJsStep} from './base';
import {ExtenderGenerationSchema} from "../extenders/base";
import {ExpressionType} from "../../providers/php-provider";
import {pluralKebabCaseModel} from "../../utils/model-name";

export class GenerateModelDefinition extends BaseJsStep {
  type = 'Generate JS Model Definition';

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
              value: '${modelType}'
            },
            {
              type: ExpressionType.CLASS_CONST,
              value: '${className}',
            }
          ],
        }
      ]
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
        initial: (_prev, values) => {
          return pluralKebabCaseModel(values.get('className') as string);
        }
      }
    ]
  };

  exposes = [];

  getExposed(_paths: Paths, _paramProvider: IO): Record<string, unknown> {
    return {};
  }

  protected async getDefinition(): Promise<null> {
    return Promise.resolve(null);
  }
}
