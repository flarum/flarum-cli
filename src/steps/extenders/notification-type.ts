import { Validator } from '../../utils/validation';
import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import chalk from 'chalk';

export class GenerateNotificationTypeExtender extends BaseExtenderStep {
  type = 'Generate Notification Type extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: '\\Flarum\\Extend\\Notification',
      },
      methodCalls: [
        {
          methodName: 'type',
          args: [
            {
              type: ExpressionType.CLASS_CONST,
              value: '${blueprintClass}',
              auxiliaryValue: 'class',
            },
            {
              type: ExpressionType.SCALAR,
              value: (params: Record<string, any>): string[] => params.notificationChannels,
            },
          ],
        },
      ],
    },
    params: [
      {
        name: 'blueprintClass',
        type: 'text',
        validate: Validator.class,
        message: `Blueprint Class (${chalk.dim('Vendor\\Path\\Event')})`,
      },
      {
        name: 'notificationChannels',
        type: 'multiselect',
        message: 'Notification Channels',
        choices: [
          { title: 'alert', value: 'alert', selected: true },
          { title: 'email', value: 'email', selected: true },
        ],
      },
    ],
  };
}
