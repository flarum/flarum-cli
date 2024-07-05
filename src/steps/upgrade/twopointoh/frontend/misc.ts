import {BaseUpgradeStep, GitCommit, Replacement, ReplacementResult} from "../base";
import chalk from "chalk";

export default class Misc extends BaseUpgradeStep {
  type = 'Miscellaneous frontend changes';

  // - [`IndexPage.prototype.sidebar` -> `IndexSidebar`](https://github.com/flarum/framework/blob/72f89c0209a5c4bbdc5482ecbdc2435dcd57550f/framework/core/js/src/forum/components/IndexSidebar.tsx)
  // - [`IndexPage.prototype.navItems` -> `IndexSidebar.prototype.navItems`](https://github.com/flarum/framework/blob/72f89c0209a5c4bbdc5482ecbdc2435dcd57550f/framework/core/js/src/forum/components/IndexSidebar.tsx)
  // - [`IndexPage.prototype.sidebarItems` -> `IndexSidebar.prototype.items`](https://github.com/flarum/framework/blob/72f89c0209a5c4bbdc5482ecbdc2435dcd57550f/framework/core/js/src/forum/components/IndexSidebar.tsx)
  // - `IndexPage.prototype.currentTag` -> `app.currentTag`
  // - `avatar(...)`  `icon(...)` -> `<Avatar ... />` `<Icon ... />`
  // - `this.currentTag` -> `app.currentTag`
  // - `UploadImageButton` namespace `admin` -> `common`

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.js') && ! file.endsWith('.ts') && ! file.endsWith('.tsx') && ! file.endsWith('.jsx')) return [];

    return [
      this.updateIndexPage(),
      this.updateAvatarIcon(),
      this.updateCurrentTag(),
      this.updateUploadImageButton(),
    ];
  }

  targets(): string[] {
    return [
      'js/src/**/*',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): misc frontend changes',
      description: 'Miscellaneous frontend changes'
    };
  }

  pauseMessage(): string {
    const link = 'https://docs.flarum.org/extend/update-2_0#miscellaneous';
    const readMore = chalk.dim(`Read more: ${link}`);

    return `Various breaking frontend changes have been made in 2.0. The tool has attempted to update your code accordingly.
Please review the changes and ensure everything is correct.
${readMore}`;
  }

  private updateIndexPage(): Replacement {
    return (file, code) => {
      if (!file.includes('IndexPage.prototype')) return null;

      return {
        imports: [{
          name: 'IndexSidebar',
          defaultImport: true,
          path: 'flarum/forum/components/IndexSidebar',
        }],
        updated: code
          .replace(/IndexPage\.prototype\.sidebar/g, 'IndexSidebar')
          .replace(/IndexPage\.prototype\.navItems/g, 'IndexSidebar.prototype.navItems')
          .replace(/IndexPage\.prototype\.sidebarItems/g, 'IndexSidebar.prototype.items')
          .replace(/IndexPage\.prototype\.currentTag/g, 'app.currentTag'),
      };
    };
  }

  private updateAvatarIcon(): Replacement {
    return (file, code, advanced) => {
      const imports = [];

      if (code.includes('flarum/common/helpers/avatar')) {
        imports.push({
          name: 'Avatar',
          defaultImport: true,
          path: 'flarum/common/components/Avatar',
        });
      }

      if (code.includes('flarum/common/helpers/icon')) {
        imports.push({
          name: 'Icon',
          defaultImport: true,
          path: 'flarum/common/components/Icon',
        });
      }

      if (imports.length === 0) return null;

      const regexes = [
        /(\w+):\s*({[^,}]+}),?/g,
        /["']([^"']+)["']:\s*({[^,}]+}),?/g,
        /["']([^"']+)["']:\s*([^,}]+),?/g,
        /(\w+):\s*([^,}]+),?/g
      ];

      return {
        imports,
        updated: code
          // avatar(user, { ... }) => <Avatar user={user} { ... } />
          // avatar(user, { className: 'haha', 'attr2': 101 }) => <Avatar user={user} className="haha" attr2={101} />
          .replace(/{?avatar\(([^),]+)(?:,\s*{([^}]+)})?\)}?/g, (match, user, attrs) => {
            if (! attrs) return `<Avatar user={${user}} />`;

            regexes.forEach((regex) => {
              attrs = attrs.replace(regex, '$1={$2}')
            })

            return `<Avatar user={${user}} ${attrs.replace(' }', '}').trim()} />`;
          })
          .replace(/import\s+(\w+)\s+from\s+["']flarum\/common\/helpers\/avatar["'];/g, '')
          // icon('fas fa-user', { ... }) => <Icon name="fas fa-user" { ... } />
          // icon('fas fa-user', { className: 'haha', 'attr2': 101 }) => <Icon name="fas fa-user" className="haha" attr2={101} />
          .replace(/{?icon\(([^),]+)(?:,\s*{([^}]+)})?\)}?/g, (match, name, attrs) => {
            if (! attrs) return `<Icon name="${name.replaceAll("'", '')}" />`;

            regexes.forEach((regex) => {
              attrs = attrs.replace(regex, '$1={$2}')
            })

            return `<Icon name="${name}" ${attrs.replace(' }', '}').trim()} />`;
          })
          .replace(/import\s+(\w+)\s+from\s+["']flarum\/common\/helpers\/icon["'];/g, ''),
      };
    };
  }

  private updateCurrentTag(): Replacement {
    return (file, code) => {
      if (!code.includes('this.currentTag')) return null;

      return {
        updated: code.replace(/this\.currentTag/g, 'app.currentTag'),
      };
    };
  }

  private updateUploadImageButton(): Replacement {
    return (file, code) => {
      if (!code.includes('UploadImageButton')) return null;

      return {
        updated: code
          // /admin => /common
          .replace(/flarum\/admin\/components\/UploadImageButton/g, 'flarum/common/components/UploadImageButton')
          .replace(/flarum\/components\/UploadImageButton/g, 'flarum/common/components/UploadImageButton')
          // <UploadImageButton name="favicon" />
          // =>
          // <UploadImageButton name="favicon" routePath="favicon" value={app.data.settings.favicon_path} url={app.forum.attribute('faviconUrl')} />
          .replace(/<UploadImageButton\s+name="([\dA-z-]+)"\s*/g, '<UploadImageButton name="$1" routePath="$1" value={app.data.settings[\'$1_path\']} url={app.forum.attribute(\'$1Url\')}')
          // UploadImageButton.component({
          //   name: 'fof-watermark',
          //   ...
          // }),
          // =>
          // UploadImageButton.component({
          //   name: 'fof-watermark',
          //   routePath: 'fof-watermark',
          //   value: app.data.settings['fof-watermark_path'],
          //   url: app.forum.attribute('fof-watermarkUrl'),
          //   ...
          // }),
          .replace(/UploadImageButton\.component\(\s*{([^}]+),?\s*}\s*\)/g, (_match, attrs) => {
            const name = attrs.match(/name: ["']([^"']+)["']/)?.[1];

            return `UploadImageButton.component({${attrs}, routePath: '${name}', value: app.data.settings['${name}_path'], url: app.forum.attribute('${name}Url')})`;
          }),
      }
    };
  }
}
