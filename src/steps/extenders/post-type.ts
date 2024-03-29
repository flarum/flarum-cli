import { Validator } from '../../utils/validation';
import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import chalk from 'chalk';

export class GeneratePostTypeExtender extends BaseExtenderStep {
  type = 'Generate Post Type extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: '\\Flarum\\Extend\\Post',
      },
      methodCalls: [
        {
          methodName: 'type',
          args: [
            {
              type: ExpressionType.CLASS_CONST,
              value: '${postClass}',
              auxiliaryValue: 'class',
            },
          ],
        },
      ],
    },
    params: [
      {
        name: 'postClass',
        type: 'text',
        validate: Validator.class,
        message: `Post Class (${chalk.dim('Vendor\\Path\\Event')})`,
      },
    ],
  };
}
