import {AdvancedContent, BaseUpgradeStep, GitCommit, Replacement} from "../base";
import chalk from "chalk";
import {genExtScaffolder} from "../../../gen-ext-scaffolder";
import {GenerateApiResourceExtender} from "../../../extenders/api-resource";
import {StepManager} from "boilersmith/step-manager";
import {FlarumProviders} from "../../../../providers";
import {GenerateAdvancedApiResourceStub} from "../../../stubs/backend/advanced-api-resource";

export default class JsonApi extends BaseUpgradeStep {
  type = 'Prepare for JSON:API changes.';
  beforeHook = true;

  protected modelEndpoints: Record<string, any> = {};
  protected models: Record<string, any> = {};

  before(file: string, code: string, _advanced: AdvancedContent): void {
    // files with the patterns CreateXController, DeleteXController, ListXController, ShowXController, UpdateXController
    const matches = file.match(/(Create|Delete|List|Show|Update)([A-Z][A-z]+)+Controller\.php/);

    if (matches) {
      let model = matches[2];

      if (matches[1].startsWith('List')) {
        model = model.endsWith('ies') ? model.slice(0, -3) + 'y' : (model.endsWith('s') ? model.slice(0, -1) : model);
      }

      this.modelEndpoints[model] ??= [];
      this.modelEndpoints[model].push(matches[1].toLowerCase());
      return;
    }

    if (code.includes(' extends AbstractModel') && code.includes('use Flarum\\Database\\AbstractModel') || (code.includes(' extends Model') && code.includes('use Illuminate\\Database\\Eloquent\\Model'))) {
        const className = file.split('/').pop()!.replace('.php', '');
        const namespace = code.match(/namespace ([^;]+);/)?.[1];
        this.models[className] = `${namespace}\\${className}`;
    }
  }

  replacements(file: string): Replacement[] {
    if (! file.endsWith('.php')) return [];

    let collected: any = null;

    return [
      async (file, code) => {
        const output = this.php!.run('upgrade.2-0.json-api', { file, code });

        collected = output.collected;

        return {
          updated: output.code
        }
      },
      async (file) => {
        if (! collected) return null;

        if (file.endsWith('extend.php')) return null;

        if (Object.keys(collected).length > 0 && collected.serializer) {
          let modelClassName;

          if (collected.model) {
            modelClassName = collected.model.split('\\').pop();
          } else if (this.models[collected.serializer.replace('Serializer', '')]) {
            modelClassName = collected.serializer.replace('Serializer', '');
          }

          const predefinedParams = {
            className: `${modelClassName}Resource`,
            modelClass: collected.model || this.models[modelClassName],
            modelType: collected.type,
            endpoints: this.modelEndpoints[modelClassName] ?? [],
            relations: collected.relations,
          };

          const result = await this.command.runSteps(
            (new StepManager<FlarumProviders>()).silentGroup((steps) => {
              steps
                .namedStep('api-resource-stub', new GenerateAdvancedApiResourceStub(this.command.STUB_PATH, genExtScaffolder()), {}, [], predefinedParams)
                .step(new GenerateApiResourceExtender(), {}, [
                  {
                    sourceStep: 'api-resource-stub',
                    exposedName: 'class',
                    consumedName: 'resourceClass',
                  },
                ]);
            })
          );

          if (! result.succeeded) {
            this.command.error(result.error);
          }
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
      message: 'chore(2.0): JSON:API changes',
      description: 'Flarum 2.0 completely changes the JSON:API implementation'
    };
  }

  pauseMessage(): string {
    const link = 'https://docs.flarum.org/extend/update-2_0#jsonapi';
    const readMore = chalk.dim(`Read more: ${link}`);
    const exampleBeforeLink = 'https://github.com/flarum/framework/blob/1.x/extensions/tags';
    const exampleAfterLink = 'https://github.com/flarum/framework/blob/2.x/extensions/tags';
    const exampleReadMore = chalk.dim(`We recommend looking at a comparison between the bundled extensions (like tags) from 1.x to 2.x to have a better understanding of the changes:`);

    return `Flarum 2.0 completely refactors the JSON:API implementation. The way resource CRUD operations, serialization and extending other resources is done has completely changed.
The tool cannot completely automate this change, but it has added some boilerplate code and TODO comments to help you get started.
You should make whatever changes you can now, then properly test and adapt your code once the upgrade process is over.

${readMore}

${exampleReadMore}
${exampleBeforeLink}
${exampleAfterLink}`;
  }
}
