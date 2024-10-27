import {BaseUpgradeStep, GitCommit, Replacement} from "./base";
import chalk from "chalk";

export default class Dependencies extends BaseUpgradeStep {
  type = 'Update the extension dependencies to the latest versions.';

  replacements(file: string): Replacement[] {
    const replacements: Replacement[] = [];

    switch (file) {
      case 'composer.json':
        replacements.push(this.updateComposerJson());
        break;
      case 'js/package.json':
        replacements.push(this.updatePackageJson());
    }

    return replacements;
  }

  targets(): string[] {
    return [
      'composer.json',
      'js/package.json',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): update dependencies',
      description: 'Update dependencies to Flarum 2.0 compatible versions.',
    };
  }

  pauseMessage(): string {
    const composerInstall = chalk.bgYellowBright('composer install');
    const composerUpdate = chalk.bgYellowBright('composer update');
    const yarn = chalk.bgYellowBright('yarn');
    const npm = chalk.bgYellowBright('npm install');

    return `Dependencies updated. Please review the changes and update any other dependency versions as needed.
                     It is recommended to run ${composerInstall} or ${composerUpdate} and ${yarn} or ${npm} now.
                     But you may also leave that until the upgrade process is over.`;
  }

  updateComposerJson(): Replacement {
    return (_file, _code, advanced) => {
      const composer = advanced as Record<string, any>;

      const moves = {
        'blomstra/gdpr': 'flarum/gdpr',
      };

      for (let [key, value] of Object.entries(composer.require || {})) {
        Object.entries(moves).forEach(([from, to]) => {
          if (key === from) {
            composer.require[to] = value;
            delete composer.require[key];
            key = to;
          }
        });

        if (key.startsWith('flarum/') && value !== '*') {
          composer.require[key] = '^2.0.0';
        }
      }

      for (let [key, value] of Object.entries(composer['require-dev'] || {})) {
        Object.entries(moves).forEach(([from, to]) => {
          if (key === from) {
            composer['require-dev'][to] = value;
            delete composer['require-dev'][key];
            key = to;
          }
        });

        if (key.startsWith('flarum/') && (value as string).startsWith('^1')) {
          composer['require-dev'][key] = '^2.0.0';
        }
      }

      return {
        updated: composer,
      };
    }
  }

  updatePackageJson(): Replacement {
    return (_file, _code, advanced) => {
      advanced = advanced as Record<string, any>;

      const map: Record<string, string> = {
        'flarum-webpack-config': '^3.0.0',
        'flarum-tsconfig': '^2.0.0',
      }

      const dependencies = advanced.dependencies || advanced.devDependencies;

      for (const [key] of Object.entries(dependencies)) {
        if (map[key]) {
          dependencies[key] = map[key];
        }
      }

      return {
        updated: advanced,
      };
    };
  }
}
