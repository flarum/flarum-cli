import chalk from 'chalk';
import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';
import { StubGenerationSchema } from 'boilersmith/steps/stub-base';
import s from 'string';
import { Answers } from 'prompts';

export class GenerateCommandStub extends BasePhpStubStep {
  type = 'Generate a command class';

  protected additionalExposes = [];

  protected phpClassParams = [];

  protected schema: StubGenerationSchema = {
    recommendedSubdir: 'Console',
    sourceFile: 'backend/command.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Command class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'commandName',
        type: 'text',
        message: `Command name (${chalk.dim('namespace:command')})`,
        validate: Validator.commandName,
        initial: (_prev: string, params: Answers<string>): string => {
          const extensionId = params.get('extensionId') as string;
          const command = s(params.get('className') as string)
            .underscore()
            .dasherize()
            .toString()
            .replace(/-command$/, '');

          return `${extensionId}:${command}`;
        },
      },
      {
        name: 'commandDescription',
        type: 'text',
        message: 'Command description',
        initial: (_prev: string, params: Answers<string>): string =>
          s(params.get('className') as string)
            .humanize()
            .toString(),
      },
    ],
  };
}
