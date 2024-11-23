import {BaseUpgradeStep, GitCommit, Replacement} from "../base";
import chalk from "chalk";

export default class InterventionImage extends BaseUpgradeStep {
  type = 'Intervention Image Library v3';

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.php')) return [];

    return [
      (file, code) => ({
        updated: this.php!.run('upgrade.2-0.intervention-image', { file, code }).code
      })
    ];
  }

  targets(): string[] {
    return [
      'src/**/*',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): `intervention/image` v3 changes',
      description: 'Intervention Image Library v3 changes'
    };
  }

  pauseMessage(): string {
    const link = 'https://docs.flarum.org/2.x/extend/update-2_0#intervention-image-v3';
    const readMore = chalk.dim(`Read more: ${link}`);
    const otherLink = 'https://image.intervention.io/v3/introduction/upgrade';
    const otherReadMore = chalk.dim(`For more details, read the library's v3 upgrade guide: ${otherLink}`);
    const additionalLink = 'https://github.com/flarum/framework/pull/3947/files';
    const additionalReadMore = chalk.dim(`Additionally, you can see the changes made to the core code here: ${additionalLink}`);

    return `Flarum 2.0 uses intervention/image v3. The tool cannot automatically update your code to the new version.
                     Comments have been added where changes are needed. You should make these changes now, then test and adapt your code once the upgrade process is over.
                     ${readMore}
                     ${otherReadMore}

                     ${additionalReadMore}`;
  }
}
