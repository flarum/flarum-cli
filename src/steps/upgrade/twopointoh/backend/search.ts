import {AdvancedContent, BaseUpgradeStep, GitCommit, Replacement} from "../base";
import chalk from "chalk";
import {table} from "cli-ux/lib/styled/table";
import flags = table.flags;
import {StepManager} from "boilersmith/step-manager";
import {FlarumProviders} from "../../../../providers";
import {GenerateAdvancedApiResourceStub} from "../../../stubs/backend/advanced-api-resource";
import {genExtScaffolder} from "../../../gen-ext-scaffolder";
import {GenerateApiResourceExtender} from "../../../extenders/api-resource";
import {GenerateGambitStub} from "../../../stubs/frontend/gambit";
import {GenerateSearchGambitExtender} from "../../../js/search-gambit";
import {LocaleStep} from "../../../locale/base";
import s from "string";

type Gambit = {
  name: string;
  pattern: string;
  filterKey?: string;
}

export default class Search extends BaseUpgradeStep {
  type = 'Search & Filter API changes';
  beforeHook = true;
  generatedFrontendStuff = false;

  protected gambits: Gambit[] = [];
  protected data: { collectedData: any, replacements: { from: string, to: string }[] } = { collectedData: {}, replacements: [] };
  protected searchers: Record<string, string> = {};

  before(file: string, code: string, _advanced: AdvancedContent): void {
    if (code.includes(' extends AbstractSearcher')) {
      const className = file.split('/').pop()!.replace('.php', '');
      const namespace = code.match(/namespace ([^;]+);/)?.[1];
      this.searchers[className] = `${namespace}\\${className}`;
    }
  }

  replacements(_file: string): Replacement[] {
    return [
      (file, code) => {
        if (code.includes(' extends AbstractRegexGambit') || /implements ([\dA-z]+,\s*)*GambitInterface/.test(code)) {
          const oldName = file.split('/')
            .pop()!
            .replace('.php', '');
          const name = oldName
            .replace('FilterGambit', 'Gambit')
            .replace('GambitFilter', 'Gambit')
            .replace('Filter', 'Gambit');
          const filterName = name.replace('Gambit', 'Filter');
          const pattern = code.match(/protected function getGambitPattern\(\)(?:: string)?\s*{\s*return '(.*)';\s*}/)?.[1];
          const filterKey = code.match(/function getFilterKey\(\)(?:: string)?\s*{\s*return '(.*)';\s*}/)?.[1];

          if (pattern || /^\s+public function apply\(SearchState \$.+$/m.test(code)) {
            if (pattern) this.gambits.push({name, pattern, filterKey});

            // old fully qualified class name to new fully qualified class name
            const namespace = code.match(/namespace ([^;]+);/)?.[1];
            this.data.replacements.push({ from: `${namespace}\\${oldName}`, to: `${namespace}\\${filterName}` });

            return {
              newPath: file.replace('FilterGambit', 'Filter')
                .replace('GambitFilter', 'Filter')
                .replace('Gambit', 'Filter'),
              updated: code
                .replace(oldName, filterName)
                .replace(' extends AbstractRegexGambit', '')
                .replace('use Flarum\\Search\\AbstractRegexGambit;\n', '')
                .replace('use Flarum\\Search\\GambitInterface;\n', '')
                .replace(/implements ([\dA-z]+,\s*)*GambitInterface(,\s*)?/, 'implements $1')
                .replace(/\s*protected function getGambitPattern\(\)(?:: string)?\s*{\s*return '.*';\s*}/, '')
                .replace(/\s*protected function conditions\(([^)]*)\)\s*{.*?[^ ] {4}}/s, '')
                .replace(/\s*public function apply\(([^)]*)\)\s*{.*?[^ ] {4}}/s, '')
            }
          }
        }

        return null;
      },

      async (file, code) => {
        const output = this.php!.run('upgrade.2-0.search', { file, code, data: this.data });

        if (output.searchers) {
          this.data.collectedData.searchers = { ...this.data.collectedData.searchers, ...output.searchers };
        }

        if (output.repositories) {
          this.data.collectedData.repositories = { ...this.data.collectedData.repositories, ...output.repositories };
        }

        return {
          updated: output.code,
        };
      },

      (file, code) => {
        if (! code.includes(' extends AbstractFilterer') || ! code.includes('use Flarum\\Filter\\AbstractFilterer')) {
          return null;
        }

        const className = file.split('/').pop()!.replace('.php', '');
        const wouldbeSearcher = className?.replace('Filterer', 'Searcher');

        if (this.searchers[wouldbeSearcher]) {
          // there is already an equivalent searcher
          return {
            delete: true,
            updated: null,
          };
        }

        return {
          newPath: file.replace(className, wouldbeSearcher),
          updated: code
            .replace('Flarum\\Filter\\AbstractFilterer', 'Flarum\\Search\\Database\\AbstractSearcher')
            .replace('AbstractFilterer', 'AbstractSearcher')
            .replace(className, wouldbeSearcher),
        };
      },

      async (_file) => {
        if (this.gambits.length > 0 && ! this.generatedFrontendStuff) {
          const result = await this.command.runSteps(
            (new StepManager<FlarumProviders>()).silentGroup((steps) => {
              this.gambits.forEach((gambit, index) => {
                let gambitKey = gambit.pattern.replace('is:', '');

                if (gambitKey.includes(':')) {
                  gambitKey = gambitKey.split(':')[0];
                }

                steps
                  .namedStep(`gambit-${index}`, new GenerateGambitStub(this.command.STUB_PATH, genExtScaffolder()), {}, [], {
                    frontend: 'common',
                    className: gambit.name,
                    type: gambit.pattern.includes('is:') ? 'boolean' : 'key-value',
                    filterKey: gambit.filterKey,
                  })
                  .step(new GenerateSearchGambitExtender(), {}, [
                    {
                      sourceStep: `gambit-${index}`,
                      exposedName: 'classNamespace',
                      consumedName: 'className',
                    },
                  ], {
                    frontend: 'common',
                    modelType: 'discussions',
                  })
                  .step(new LocaleStep(genExtScaffolder()), {}, [], {
                    key: `lib.gambits.${gambit.filterKey}.key`,
                    value: gambitKey
                  });
              });
            })
          );

          if (! result.succeeded) {
            this.command.error(result.error);
          }

          this.generatedFrontendStuff = true;
        }

        return null;
      }
    ];
  }

  targets(): string[] {
    return [
      'src/**/*',
      'extend.php',
    ];
  }

  gitCommit(): GitCommit {
    return {
      message: 'chore(2.0): Search & Filter API changes',
      description: 'Flarum 2.0 introduces a search driver implementation and moves gambits to the frontend.',
    };
  }

  pauseMessage(): string {
    const link = 'https://docs.flarum.org/extend/update-2_0#searchfilter-system';
    const readMore = chalk.dim(`Read more: ${link}`);
    const exampleBeforeLink = 'https://github.com/flarum/framework/blob/1.x/extensions/tags';
    const exampleAfterLink = 'https://github.com/flarum/framework/blob/2.x/extensions/tags';
    const exampleReadMore = chalk.dim(`We recommend looking at a comparison between the bundled extensions (like tags) from 1.x to 2.x to have a better understanding of the changes:`);

    return `Flarum 2.0 introduces a new search driver implementation. It also merges Filterers and Searchers into a single API. Gambits are now handled on the frontend side where they are converted to filters.
The tool has attempted to automatically update your codebase, please review the changes then proceed with the upgrade.

${readMore}

${exampleReadMore}
${exampleBeforeLink}
${exampleAfterLink}`;
  }
}
