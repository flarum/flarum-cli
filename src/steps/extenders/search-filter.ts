import { Validator } from '../../utils/validation';
import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import chalk from 'chalk';

export class GenerateSearchFilterExtender extends BaseExtenderStep {
  type = 'Generate search filter extender';

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
        ],
      },
      methodCalls: [
        {
          methodName: 'addFilter',
          args: [
            {
              type: ExpressionType.CLASS_CONST,
              value: '${searcherClass}',
              auxiliaryValue: 'class',
            },
            {
              type: ExpressionType.CLASS_CONST,
              value: '${filterClass}',
              auxiliaryValue: 'class',
            },
          ],
        },
      ],
    },
    params: [
      {
        name: 'filterClass',
        type: 'text',
        message: `Filter class (${chalk.dim('Vendor\\Path\\Filter')})`,
        validate: Validator.class,
      },
      {
        name: 'driverClass',
        type: 'text',
        validate: Validator.class,
        message: 'Driver Class',
        initial: 'Flarum\\Search\\Database\\DatabaseSearchDriver',
      },
      {
        name: 'searcherClass',
        type: 'text',
        validate: Validator.class,
        message: `Model searcher class (${chalk.dim('Vendor\\Path\\Searcher')})`,
      },
    ],
  };
}
