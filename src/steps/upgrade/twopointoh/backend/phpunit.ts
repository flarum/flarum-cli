import {BaseUpgradeStep, GitCommit, Replacement} from "../base";
import chalk from "chalk";

export default class PhpUnit extends BaseUpgradeStep {
  type = 'PHPUnit 9 to 11 changes';

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.php')) return [];

    return [
      (_file, code) => ({
        updated: this.php!.run('upgrade.2-0.phpunit', { file, code }).code
      })
    ];
  }

  targets(): string[] {
    return [
      'tests/**/*',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): PHPUnit 9 to 11 changes',
      description: 'Flarum 2.0 uses PHPUnit 11.',
    };
  }

  pauseMessage(): string {
    const links = [
      'https://github.com/sebastianbergmann/phpunit/blob/9.6/DEPRECATIONS.md',
      'https://github.com/sebastianbergmann/phpunit/blob/10.5/DEPRECATIONS.md',
      'https://github.com/sebastianbergmann/phpunit/blob/11.3.0/DEPRECATIONS.md',
    ];

    return `Flarum 2.0 uses PHPUnit 11. The tool has applied the most significant changes, but you might still run into other deprecations.
                     Please refer to the following links for more information:
                     ${links.map(link => chalk.underline(link)).join('\n                     ')}`;
  }
}
