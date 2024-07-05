import {BaseUpgradeStep, GitCommit, ImportChange, Replacement} from "../base";
import chalk from "chalk";
import * as t from '@babel/types';
import traverse from "@babel/traverse";
import {getFunctionName} from "../../../../utils/ast";
import generate from "@babel/generator";

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
          import: {
            name: 'IndexSidebar',
            defaultImport: true,
            path: 'flarum/forum/components/IndexSidebar',
          }
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
      const imports: ImportChange[] = [];

      if (code.includes('flarum/common/helpers/avatar')) {
        imports.push({
          replacesPath: 'flarum/common/helpers/avatar',
          import: {
            name: 'Avatar',
            defaultImport: true,
            path: 'flarum/common/components/Avatar',
          },
        });
      }

      if (code.includes('flarum/common/helpers/icon')) {
        imports.push({
          replacesPath: 'flarum/common/helpers/icon',
          import: {
            name: 'Icon',
            defaultImport: true,
            path: 'flarum/common/components/Icon',
          },
        });
      }

      if (imports.length === 0) return null;

      const ast = advanced as t.File;

      traverse(ast, {
        CallExpression(path) {
          const node = path.node;
          const funcName = getFunctionName(node.callee);
          const args = node.arguments;

          if (['avatar', 'icon'].includes(funcName || '')) {
            const userOrName = args[0];
            const attrs = args[1];

            if (! t.isExpression(userOrName) && ! t.isStringLiteral(userOrName)) {
              console.warn(`Unknown userOrName type for ${funcName} in ${file}: ${userOrName.type}`);
              return;
            }

            let attrsToJsx = null

            if (attrs && t.isObjectExpression(attrs)) {
              attrsToJsx = (attrs as t.ObjectExpression).properties
                .filter((prop) => t.isObjectProperty(prop) && ! t.isArrayPattern(prop.value))
                .map((prop) => {
                  prop = prop as t.ObjectProperty;

                  const key = 'value' in prop.key ? prop.key.value : ('name' in prop.key ? prop.key.name : prop.key.type);

                  if (t.isArrayPattern(prop.value) || t.isObjectPattern(prop.value) || t.isRestElement(prop.value)) {
                    console.warn('Failed to convert to JSX: ', { [key.toString()]: prop.value });
                    return null;
                  }

                  if (t.isAssignmentPattern(prop.value)) {
                    return t.jsxAttribute(
                      t.jsxIdentifier(key.toString()),
                      t.isStringLiteral(prop.value.right) ? prop.value.right : t.jsxExpressionContainer(prop.value.right)
                    );
                  }

                  try {
                    return t.jsxAttribute(
                      t.jsxIdentifier(key.toString()),
                      t.isStringLiteral(prop.value) ? prop.value : t.jsxExpressionContainer(prop.value)
                    );
                  } catch (error) {
                    console.log({ [key.toString()]: prop.value });
                    throw error;
                  }
                }) as t.JSXAttribute[];
            } else if (attrs && t.isIdentifier(attrs)) {
              attrsToJsx = [t.jsxSpreadAttribute(attrs)];
            } else if (attrs) {
              console.warn(`Unknown attrs type for ${funcName} in ${file}: ${attrs.type}`);
            }

            const tag = t.jsxIdentifier(funcName === 'avatar' ? 'Avatar' : 'Icon');
            const mainArgName = funcName === 'avatar' ? 'user' : 'name';
            const mainArg = t.jsxAttribute(t.jsxIdentifier(mainArgName), t.isStringLiteral(userOrName) ? userOrName : t.jsxExpressionContainer(userOrName));

            const jsxElem = t.jsxElement(
              t.jsxOpeningElement(tag, [mainArg, ...attrsToJsx || []], true),
              null,
              [],
              true
            );

            // If the node is enclosed in { ... }, remove them
            if (t.isJSXExpressionContainer(path.parent)) {
              path.parentPath.replaceWith(jsxElem);
            } else {
              path.replaceWith(jsxElem);
            }
          }
        }
      });

      return {
        imports,
        updated: ast
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
            const name = attrs.match(/name: ["']([^"']+)["'],?/)?.[1];

            // remove ,
            attrs = attrs.replace(/,\s*$/, '');

            return `UploadImageButton.component({${attrs}, routePath: '${name}', value: app.data.settings['${name}_path'], url: app.forum.attribute('${name}Url')})`;
          }),
      }
    };
  }
}
