import {BaseUpgradeStep, GitCommit, Replacement} from "../base";
import chalk from "chalk";

export default class Mailer extends BaseUpgradeStep {
  type = 'Check for Swift mailer usage.';

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.php')) return [];

    return [
      (_file, code) => ({
        updated: code.replace(/^(.*Swift_Mailer.*)$/gm, `$1 // TODO: Swift mailer was replaced with Symfony mailer`)
      })
    ];
  }

  targets(): string[] {
    return [
      'extend.php',
      'src/**/*',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): swift mailer was replaced with symfony mailer',
      description: 'Swift mailer was replaced with Symfony mailer'
    };
  }

  pauseMessage(): string {
    const link = 'https://symfony.com/doc/current/mailer.html';
    const readMore = chalk.dim(`Read more: ${link}`);

    return `Flarum 2.0 uses Symfony mailer instead of Swift mailer. TODO comments have been added to your code to indicate where Swift mailer is currently being used.
                     Update your code to use Symfony mailer instead. Then proceed. Or proceed now and update your code later.
                     ${readMore}`;
  }
}
