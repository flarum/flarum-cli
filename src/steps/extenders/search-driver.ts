import { Validator } from '../../utils/validation';
import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import chalk from 'chalk';

export class GenerateSearchDriverExtender extends BaseExtenderStep {
  type = 'Generate Search Driver extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: '\\Flarum\\Extend\\SearchDriver',
        args: [
          {
            type: ExpressionType.CLASS_CONST,
            value: '${driverClass}',
            auxiliaryValue: 'class',
          },
        ]
      },
      methodCalls: [],
    },
    params: [
      {
        name: 'driverClass',
        type: 'text',
        validate: Validator.class,
        message: `Driver Class (${chalk.dim('Vendor\\Path\\Event')})`,
      },
    ],
  };
}
