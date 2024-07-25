import {BaseUpgradeStep, GitCommit, Replacement} from "../base";
import chalk from "chalk";

export default class MiscBackendChanges extends BaseUpgradeStep {
  type = 'Miscellaneous backend changes';

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.php')) return [];

    return [
      (file, code) => ({
        updated: this.php!.run('upgrade.2-0.misc', { file, code }).code
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
      message: 'chore(2.0): misc backend changes',
      description: 'Miscellaneous backend changes'
    };
  }

  pauseMessage(): string {
    const link = 'https://docs.flarum.org/extend/update-2_0#miscellaneous-1';
    const readMore = chalk.dim(`Read more: ${link}`);

    return `Various breaking backend changes have been made in 2.0. The tool has attempted to update your code accordingly.
Please review the changes and ensure everything is correct.
${readMore}`;
  }
}
