import { Validator } from '../../utils/validation';
import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import chalk from 'chalk';

export class GenerateApiResourceExtender extends BaseExtenderStep {
  type = 'Generate Api Resource extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: '\\Flarum\\Extend\\ApiResource',
        args: [
          {
            type: ExpressionType.CLASS_CONST,
            value: '${resourceClass}',
            auxiliaryValue: 'class',
          },
        ]
      },
      methodCalls: [],
    },
    params: [
      {
        name: 'resourceClass',
        type: 'text',
        validate: Validator.class,
        message: `API Resource Class (${chalk.dim('Vendor\\Path\\Event')})`,
      },
    ],
  };
}
