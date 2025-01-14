import { Validator } from '../../utils/validation';
import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import chalk from 'chalk';
import s from 'string';

export class GenerateNotificationDriverExtender extends BaseExtenderStep {
  type = 'Generate Notification Driver extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: '\\Flarum\\Extend\\Notification',
      },
      methodCalls: [
        {
          methodName: 'driver',
          args: [
            {
              type: ExpressionType.SCALAR,
              value: '${driverName}',
            },
            {
              type: ExpressionType.CLASS_CONST,
              value: '${driverClass}',
              auxiliaryValue: 'class',
            },
          ],
        },
      ],
    },
    params: [
      {
        name: 'driverClass',
        type: 'text',
        validate: Validator.class,
        message: `Driver Class (${chalk.dim('Vendor\\Path\\Driver')})`,
      },
      {
        name: 'driverName',
        type: 'text',
        message: 'Driver Name',
        initial: (_prev, params) =>
          s((params.get('driverClass') as string).split('\\').pop())
            .underscore()
            .camelize()
            .toString()
            .replace(/NotificationDriver$/, '')
            .replace(/Driver$/, ''),
      },
    ],
  };
}
