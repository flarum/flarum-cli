import {BaseUpgradeStep, GitCommit, Replacement} from "../../base";
import chalk from "chalk";

export default class ExtendLazyModules extends BaseUpgradeStep {
  type = 'Some Flarum modules are now lazy loaded. Extending them requires a different approach.';

  // Array.from(flarum.reg.chunks.entries().flatMap(e => e[1].modules.map(m => e[1].namespace + ':' + m)))
  // "core:forum/components/ReplyComposer"
  // "core:forum/components/LogInModal"
  // "core:forum/components/PostStream"
  // "core:forum/components/PostStreamScrubber"
  // "core:forum/components/SearchModal"
  // "core:forum/components/SignUpModal"
  // "core:forum/components/EditPostComposer"
  // "core:common/components/EditUserModal"
  // "core:forum/components/DiscussionComposer"
  // "core:forum/components/DiscussionsUserPage"
  // "core:forum/components/SettingsPage"
  // "core:forum/components/UserSecurityPage"
  // "core:forum/components/NotificationsPage"
  // "core:forum/components/Composer"
  // "flarum-tags:forum/components/TagDiscussionModal"
  // "flarum-tags:common/components/TagSelectionModal"
  // "flarum-tags:forum/components/ToggleButton"
  // "flarum-emoji:forum/emojiMap"

  private static LAZY_MODULES: Record<string, Record<string, string[]>> = {
    flarum: {
      admin: [],
      forum: [
        'Composer',
        'DiscussionsUserPage',
        'ForgotPasswordModal',
        'NotificationsPage',
        'PostStreamScrubber',
        'SearchModal',
        'SignUpModal',
        'DiscussionComposer',
        'EditPostComposer',
        'LogInModal',
        'PostStream',
        'ReplyComposer',
        'SettingsPage',
        'UserSecurityPage',
      ],
      common: ['EditUserModal'],
    },
    'flarum/tags': {
      admin: [],
      forum: ['TagDiscussionModal', 'TagSelectionModal', 'ToggleButton'],
      common: [],
    },
    'flarum/emoji': {
      admin: [],
      forum: ['EmojiMap'],
      common: [],
    },
  };

  replacements(file: string, code: string): Replacement[] {
    if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
      // Skip files that have none of the lazy modules.
      let includesAny = false;

      // eslint-disable-next-line guard-for-in
      for (const namespace in ExtendLazyModules.LAZY_MODULES) {
        // eslint-disable-next-line guard-for-in
        for (const frontend in ExtendLazyModules.LAZY_MODULES[namespace]) {
          const modules = ExtendLazyModules.LAZY_MODULES[namespace][frontend];

          for (const module of modules) {
            const packageNamespace = namespace === 'flarum' ? 'flarum' : `ext:${namespace}`;

            // eslint-disable-next-line max-depth
            if (new RegExp(`import\\s+(.+)\\s+from\\s+['"](${packageNamespace}/.+/${module})['"];`, 'g').test(code)) {
              includesAny = true;
              break;
            }
          }
        }
      }

      if (! includesAny) {
        return [];
      }

     return [
       this.updateModalShow(),
       this.updateExtending(),
     ];
    }

    return [];
  }

  targets(): string[] {
    return [
      'js/src/**/*',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): adapt to extending lazy modules',
      description: 'Some Flarum modules are now lazy loaded. Extending them requires a different approach.'
    };
  }

  pauseMessage(): string {
    const readMore = chalk.dim('Read more about code splitting in Flarum 2.0: https://docs.flarum.org/extend/code-splitting');
    const lazyLoaded = chalk.bgYellow.bold('lazy loaded');

    return `Flarum 2.0 introduces code splitting functionality. Some modules are now ${lazyLoaded}. And extending them requires a different approach.
The tool has attempted to update your code accordingly. Please review the changes and ensure everything is correct.
${readMore}`;
  }

  updateModalShow(): Replacement {
    return (_file, code) => {
      this.forEachLazyModule(code, ({module, importPath}) => {
        const before = `app.modal.show(${module})`;
        const after = `app.modal.show(() => import('${importPath}'))`;

        code = code.replace(before, after);
      });

      return {
        updated: code,
      };
    };
  }

  updateExtending(): Replacement {
    return (_file, code) => {
      this.forEachLazyModule(code, ({module, importPath, importedAs, importLine}) => {
        const beforeExtend = `extend\\(${module}\\.prototype,`;
        const afterExtend = `extend('${importPath}',`;
        const beforeOverride = `override\\(${module}\\.prototype,`;
        const afterOverride = `override('${importPath}',`;

        code = code
          // first the extend/override format.
          .replace(new RegExp(beforeExtend, 'g'), afterExtend)
          .replace(new RegExp(beforeOverride, 'g'), afterOverride)
          // then remove the import.
          .replace(importLine, '');

        // If there are still usages of the module apart from extend/override
        // add a to do comment for the extension developer.
        const match = code.match(new RegExp(`${importedAs}[^'"]`, 'g'));
        const exists = match && match.length > 1;

        if (exists) {
          code = code.replace(new RegExp(`(^${importedAs}[^'"].*$)`, 'gm'), `$1 // @TODO: Check if this usage is correct. Lazy loaded modules must be loaded using the async import function. https://docs.flarum.org/extend/code-splitting`);
        }
      });

      return {
        updated: code,
      };
    };
  }

  forEachLazyModule(code: string, callback: (options: {namespace: string, module: string, packageNamespace: string, importPath: string, importedAs: string, importLine: string}) => void): void {
    // eslint-disable-next-line guard-for-in
    for (const namespace in ExtendLazyModules.LAZY_MODULES) {
      const lazyModules = Object.values(ExtendLazyModules.LAZY_MODULES[namespace]).flat();
      const packageNamespace = namespace === 'flarum' ? 'flarum' : `ext:${namespace}`;

      for (const lazyModule of lazyModules) {
        const regex = new RegExp(`import\\s+(.+)\\s+from '(${packageNamespace}/.+/${lazyModule})';\n`, 'gmi');
        const importMatch = regex.exec(code);
        const importLine = importMatch && importMatch[0];

        if (!importLine) {
          continue;
        }

        const importPath = importMatch[2];
        const importedAs = importMatch[1];

        callback({namespace, module: lazyModule, packageNamespace, importPath, importedAs, importLine});
      }
    }
  }
}
