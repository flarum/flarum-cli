import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../base-command';
import { FlarumProviders } from '../../providers';
import { LocaleStep } from '../../steps/locale/base';
import { genExtScaffolder } from '../../steps/gen-ext-scaffolder';

export default class Locale extends BaseCommand {
  static description = 'Generate new locale key value pair.';

  static flags = { ...BaseCommand.flags };

  static args = [
    {
      name: 'key',
      description: 'The nested key of the locale (e.g. `forum.custom_modal.title`).',
      required: false,
    },
    {
      name: 'value',
      description: 'The value of the locale.',
      required: false,
    },
    ...BaseCommand.args,
  ];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.step(new LocaleStep(genExtScaffolder()));
  }
}
