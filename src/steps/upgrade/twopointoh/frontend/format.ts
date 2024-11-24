import { BaseUpgradeStep, GitCommit, Replacement } from '../base';
import { formatCode } from '../../../../utils/ast';

export default class FormatCode extends BaseUpgradeStep {
  type = 'Prettier formatting.';

  replacements(file: string): Replacement[] {
    if (!file.endsWith('.js') && !file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.jsx')) return [];

    return [
      async (_file, code) => ({
        updated: await formatCode(code, false),
      }),
    ];
  }

  targets(): string[] {
    return ['js/src/**/*'];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): code formatting with prettier',
      description: 'Start by formatting your code with Prettier.',
    };
  }

  pauseMessage(): string {
    return `Your code has been formatted with Prettier before proceeding with the upgrade.`;
  }
}
