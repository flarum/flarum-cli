import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import {Validator} from "../../utils/validation";
import chalk from "chalk";

export class GenerateMiddlewareExtender extends BaseExtenderStep {
  type = 'Generate console extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: '\\Flarum\\Extend\\Middleware',
        args: [
          {
            type: ExpressionType.SCALAR,
            value: '${frontend}',
          },
        ],
      },
      methodCalls: [
        {
          methodName: 'add',
          args: [
            {
              type: ExpressionType.CLASS_CONST,
              value: '${middlewareClass}',
              auxiliaryValue: 'class',
            },
          ],
        },
      ],
    },
    params: [
      {
        name: 'middlewareClass',
        type: 'text',
        validate: Validator.class,
        message: `Middleware Class (${chalk.dim('Vendor\\Path\\Command')})`,
      },
      {
        name: 'frontend',
        type: 'autocomplete',
        message: 'Frontend',
        choices: ['forum', 'admin', 'api'].map((type: string) => ({
          title: type,
          value: type.toLowerCase(),
        })),
      },
    ],
  };
}
