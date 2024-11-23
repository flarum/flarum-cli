import {BaseUpgradeStep, GitCommit, Replacement} from "../../base";
import chalk from "chalk";

export default class Compat extends BaseUpgradeStep {
  type = 'Replace removed compat API with simple imports.';

  private importingFromExtensions: string[] = [];
  private useExtensions: string[] = [];

  replacements(file: string): Replacement[] {
    if (file.includes('/compat.')) {
      return [this.replaceCompat()];
    }

    if (file.includes('/index.')) {
      return [this.replaceCompatUsage()];
    }

    return [];
  }

  targets(): string[] {
    return [
      'js/src/common/compat.*',
      'js/src/forum/compat.*',
      'js/src/forum/index.*',
      'js/src/admin/compat.*',
      'js/src/admin/index.*',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): remove compat API',
      description: 'The compat API has been removed. Modules from extensions are now automatically accessible from other extensions using the format ext:vendor/extension/module-path.'
    };
  }

  pauseMessage(): string {
    const format = chalk.bgCyan.bold('ext:vendor/extension/module-path');

    return `The compat API has been removed. Modules from extensions are now automatically accessible from other extensions using the format ${format}.
                     If you were using the compat API, it has been replaced with simple imports to ensure the modules are available for discovery.
                     Please review the changes and ensure everything is correct.`;
  }

  replaceCompat(): Replacement {
    return (file, code) => {
      const parentDir = file.split('/').slice(-2, -1)[0];

      return {
        newPath: file.replace('compat.', parentDir + '.'),
        updated: code
          // import compat from '../common/compat'; => import '../common/common';
          .replace(/^import\s+compat\s+from\s+["']\.\.\/common\/compat["'];$/gim, "import '../common/common';")
          // import module from '...'; => import '...';
          .replace(/^import\s+\w+\s+from\s+["'](.*)["'];$/gim, "import '$1';")
          // export default { ... }; => ''
          .replace(/export\s+default\s+{[^}]*};/gi, '')
          // export default Object.assign(compat, { ... }); => ''
          .replace(/export\s+default\s+object.assign\(compat, {[^}]*}\);/gi, '')
      };
    };
  }

  replaceCompatUsage(): Replacement {
    return (file, code) => {
      const parentDir = file.split('/').slice(-2, -1)[0];

      return {
        updated: code
          // // Expose compat API => // Allow flarum to discover modules
          .replace(/\/\/ expose compat api/gi, '// Allow flarum to discover modules')
          // import $compat from 'path/common/compat'; => import 'path/common/common';
          .replace(/^import.+from\s+["'](.*)common\/compat["'];$/gim, "import '$1common/common';")
          // import $compat from './compat'; => import './parentDir';
          .replace(/^import.+from\s+["']\.\/compat["'];$/gim, "import './" + parentDir + "';")
          // import { compat } from '@flarum/core/$frontend'; => ''
          .replace(/^import\s+{ compat }\s+from\s+["']@flarum\/core\/\w+["'];$/gim, '')
          // Object.assign(compat, module); => ''
          .replace(/^object.assign\(compat, \w+\);$/gim, '')
          // Object.assign(compat, { ... }); => ''
          .replace(/^object.assign\(compat, {[^}]*}\);$/gim, '')
      };
    };
  }
}
