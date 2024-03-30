import { Validator } from '../../utils/validation';
import { ExpressionType } from '../../providers/php-provider';
import { BaseExtenderStep, ExtenderGenerationSchema } from './base';
import chalk from 'chalk';
import s from 'string';
import { Answers } from 'prompts';

export class GenerateMailDriverExtender extends BaseExtenderStep {
  type = 'Generate Mail Driver extender';

  protected schema: ExtenderGenerationSchema = {
    extenderDef: {
      extender: {
        className: '\\Flarum\\Extend\\Mail',
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
        initial: (_prev: string, params: Answers<string>): string =>
          s((params.get('driverClass') as string).split('\\').pop())
            .underscore()
            .camelize()
            .toString()
            .replace(/MailDriver$/, '')
            .replace(/Driver$/, ''),
      },
    ],
  };
}
