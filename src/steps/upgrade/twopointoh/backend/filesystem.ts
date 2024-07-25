import {BaseUpgradeStep, GitCommit, Replacement} from "../base";
import chalk from "chalk";

export default class Filesystem extends BaseUpgradeStep {
  type = 'Filesystem dependencies changes.';

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.php')) return [];

    return [
      (file, code) => ({
        updated: this.php!.run('upgrade.2-0.filesystem', { file, code }).code
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
      message: 'chore(2.0): filesystem changes',
      description: 'Flysystem 3.x changes'
    };
  }

  pauseMessage(): string {
    const link = 'https://docs.flarum.org/extend/update-2_0#flysystem-updated-from-1x-to-3x';
    const readMore = chalk.dim(`Read more: ${link}`);
    const otherLink = 'https://flysystem.thephpleague.com/docs/upgrade-from-1.x/';
    const otherReadMore = chalk.dim(`For more details, read the Flysystem 1.x to V2 & V3 upgrade guide: ${otherLink}`);

    return `Flarum 2.0 uses Flysystem 3.x. The tool has attempted to update your code accordingly.
Some filesystem methods have been renamed or removed. Please review the changes and ensure everything is correct.
${readMore}
${otherReadMore}`;
  }
}
