import { BaseUpgradeStep, GitCommit, Replacement } from './base';

export default class Infrastructure extends BaseUpgradeStep {
  type = 'Update the extension infrastructure.';

  replacements(file: string): Replacement[] {
    const replacements = [];

    if (file.endsWith('.yml')) {
      replacements.push(this.updateWorkflow());
    }

    if (file.endsWith('.neon')) {
      replacements.push(this.updatePhpStan());
    }

    return replacements;
  }

  targets(): string[] {
    return ['.github/workflows/*.yml', 'phpstan.neon'];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): update infrastructure',
      description: 'Update the extension infrastructure',
    };
  }

  pauseMessage(): string {
    return 'Infrastructure updated. Please review the changes then proceed.';
  }

  updateWorkflow(): Replacement {
    return (_file, code) => ({
      updated: code
        .replace('REUSABLE_backend.yml@1.x', 'REUSABLE_backend.yml@2.x')
        .replace('REUSABLE_frontend.yml@1.x', 'REUSABLE_frontend.yml@2.x')
        .replace('REUSABLE_backend.yml@main', 'REUSABLE_backend.yml@2.x')
        .replace('REUSABLE_frontend.yml@main', 'REUSABLE_frontend.yml@2.x')
        .replace(/php_versions: '\["[^']+]'/, 'php_versions: \'["8.2", "8.3", "8.4"]\''),
    });
  }

  updatePhpStan(): Replacement {
    return (_file, code) => ({
      updated: code
        // remove lines
        // checkMissingIterableValueType: false
        // checkGenericClassInNonGenericObjectType: false
        .replace(/^(\s+checkMissingIterableValueType: false\n|\s+checkGenericClassInNonGenericObjectType: false\n)/gm, ''),
    });
  }
}
