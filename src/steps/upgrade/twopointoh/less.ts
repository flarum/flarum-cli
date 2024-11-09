import {BaseUpgradeStep, GitCommit, ImportChange, Replacement} from "./base";
import chalk from "chalk";

export default class LessChanges extends BaseUpgradeStep {
  type = 'LESS code changes to more vanilla CSS';

  static MODE_SPECIFIC_VARS = [
    'body-bg',
    'text-color',
    'heading-color',
    'muted-color',
    'muted-more-color',
    'shadow-color',
    'control-bg',
    'control-color',
    'control-danger-bg',
    'control-danger-color',
    'header-bg',
    'header-color',
    'header-control-bg',
    'header-control-color',
    'header-bg-colored',
    'header-color-colored',
    'header-control-bg-colored',
    'header-control-color-colored',
    'overlay-bg',
    'code-bg',
    'code-color',
  ];

  static VARS = [
    'primary-color',
    'secondary-color',
    'control-success-bg',
    'control-success-color',
    'control-warning-bg',
    'control-warning-color',
    'error-color',
    'alert-bg',
    'alert-color',
    'alert-error-bg',
    'alert-error-color',
    'alert-success-bg',
    'alert-success-color',
    'validation-error-color',
    'drawer-width',
    'pane-width',
    'header-height',
    'header-height-phone',
    'border-radius',
    'zindex-header',
    'zindex-pane',
    'zindex-composer',
    'zindex-dropdown',
    'zindex-modal-background',
    'zindex-modal',
    'zindex-alerts',
    'zindex-tooltip',
    'tooltip-bg',
    'tooltip-color',
    'online-user-circle-color',
    'link-color',
    'text-on-dark',
    'text-on-light',
  ];

  static MIXINS = [
    'animation',
    'animation-name',
    'animation-duration',
    'animation-timing-function',
    'animation-delay',
    'animation-iteration-count',
    'animation-direction',
    'animation-fill-mode',
    'backface-visibility',
    'box-shadow',
    'box-sizing',
    'content-columns',
    'hyphens',
    'scale',
    'scaleX',
    'scaleY',
    'skew',
    'translate',
    'translate3d',
    'rotate',
    'rotateX',
    'rotateY',
    'perspective',
    'perspective-origin',
    'transform-origin',
    'transition',
    'transition-property',
    'transition-delay',
    'transition-duration',
    'transition-timing-function',
    'transition-transform',
  ];

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.less')) return [];

    const replacements: Record<string, string> = {};
    const declarations: Record<string, Record<'dark' | 'light', string>> = {};

    return [
      // Replace color functions with CSS variable declarations and usage.
      (_file, code) => {
        // match all color functions
        const colorFunctions = code.match(/(fade|lighten|darken|mix|saturate|desaturate|shade|fadein|fadeout|spin|tint|greyscale|contrast)\([^)]+\)/g);

        colorFunctions?.forEach((colorFunction) => {
          const content = colorFunction.match(/(fade|lighten|darken|mix|saturate|desaturate|shade|fadein|fadeout|spin|tint|greyscale|contrast)\(([^)]+)\)/);
          let needsReplacement = false;

          for (const variable of LessChanges.MODE_SPECIFIC_VARS) {
            if (content?.[2].includes(`@${variable}`)) {
              needsReplacement = true;
              break;
            }
          }

          if (needsReplacement) {
            const varName = content![2].match(/@([A-z0-9_-]+)/)![1];
            const modifier = content![1];
            const degree = content![2].replace(/[^\d.]/g, '');
            const newVarName = `--${varName}-${modifier}-${degree}`;

            replacements[colorFunction] = `var(${newVarName})`;
            declarations[newVarName] = {
              dark: colorFunction.replace(`@${varName}`, `@${varName}-dark`),
              light: colorFunction.replace(`@${varName}`, `@${varName}-light`),
            };
          }
        });

        return null;
      },

      // Basic replacements.
      (_file, code) => {
        const replaceWithCssVars = (code: string) => code
          // property: @variable => property: var(--variable)
          .replace(/^(\s+)([^@:]+):\s*(.*)@([A-z0-9_-]+)([^;]*);(.*)$/gim, (_, indent, property, before, variable, after, comments) => {
            if (LessChanges.vars().includes(variable) && !/(fade|lighten|darken|mix|saturate|desaturate|shade|fadein|fadeout|spin|tint|greyscale|contrast)\(/.test(before)) {
              return `${indent}${property}: ${before}var(--${variable})${after};${comments}`;
            }

            return _;
          });

        for (const [colorFunction, replacement] of Object.entries(replacements)) {
          code = code.replace(colorFunction, replacement);
        }

        for (const mixin of LessChanges.MIXINS) {
          code = code.replace(new RegExp(`\.${mixin}\\((.*?)\\);`, 'g'), `${mixin}: $1;`);
        }

        code = replaceWithCssVars(replaceWithCssVars(code))
          // light/dark mode
          .replace(/\s+&\s*when\s*\(\s*@config-dark-mode\s*\)\s*{/, '[data-theme^=dark] & {')
          .replace(/\s+&\s*when\s*\(\s*@config-dark-mode\s*=\s*true\s*\)\s*{/, '[data-theme^=dark] & {')
          .replace(/\s+&\s*when\s*\(\s*@config-dark-mode\s*=\s*false\s*\)\s*{/, '[data-theme^=light] & {')
          // colored header
          .replace(/\s+&\s*when\s*\(\s*@config-colored-header\s*\)\s*{/, '[data-colored-header=true] & {')
          .replace(/\s+&\s*when\s*\(\s*@config-colored-header\s*=\s*true\s*\)\s*{/, '[data-colored-header=true] & {')
          .replace(/\s+&\s*when\s*\(\s*@config-colored-header\s*=\s*false\s*\)\s*{/, '[data-colored-header=false] & {')
          // what couldn't be changed
          .replace(/^(.*@config-dark-mode.*)$/gm, '$1 /* @TODO: use [data-theme^=dark] and [data-theme^=light] instead */')
          .replace(/^(.*@config-colored-header.*)$/gm, '$1 /* @TODO: use [data-colored-header=true] and [data-colored-header=false] instead */')
          // calculations
          .replace(/:\s*(var\(.*?\)\s*[*+/-]\s*[^;]+);/g, ': calc(~"$1");')
          .replace(/:\s*(-\s*var\(.*?\)\s*[*+/-]\s*[^;]+);/g, ': calc(~"0px$1");');

        if (Object.entries(declarations).length > 0) {
          let newLightVars = '[data-theme^=light] {';
          let newDarkVars = '[data-theme^=dark] {';

          for (const [varName, {light, dark}] of Object.entries(declarations)) {
            newLightVars += `\n  ${varName}: ${light};`;
            newDarkVars += `\n  ${varName}: ${dark};`;
          }

          newLightVars += '\n}';
          newDarkVars += '\n}';

          code += `\n\n${newLightVars}\n${newDarkVars}`;
        }

        return {
          updated: code
        }
      }
    ];
  }

  targets(): string[] {
    return [
      'less/**/*',
      'resources/less/**/*',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): `LESS` code changes',
      description: 'Many variables have been renamed to light/dark specific names and most are now used as CSS variables instead.',
    };
  }

  pauseMessage(): string {
    const link = 'https://docs.flarum.org/2.x/extend/update-2_0#miscellaneous';
    const readMore = chalk.dim(`Read more: ${link}`);
    const dataThemeDark = chalk.yellow.bold('[data-theme^=dark]');
    const dataThemeLight = chalk.yellow.bold('[data-theme^=light]');
    const dataColoredHeader = chalk.yellow.bold('[data-colored-header=true]');
    const dataColoredHeaderFalse = chalk.yellow.bold('[data-colored-header=false]');
    const configDarkMode = chalk.yellow('@config-dark-mode');
    const configColoredHeader = chalk.yellow('@config-colored-header');

    return `Many variables have been renamed to light/dark specific names and most are now used as CSS variables instead.
                     Light/Dark modes are now handled using vanilla CSS variables.

                     The ${configDarkMode} and ${configColoredHeader} variables no longer exist, use instead the following selectors:
                      - ${dataThemeDark} for dark mode
                      - ${dataThemeLight} for light mode
                      - ${dataColoredHeader} for colored header
                      - ${dataColoredHeaderFalse} for non-colored header`
  }

  static vars(): string[] {
    return [
      ...LessChanges.MODE_SPECIFIC_VARS,
      ...LessChanges.VARS,
    ];
  }
}
