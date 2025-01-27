import { StepManager } from 'boilersmith/step-manager';
import BaseCommand from '../../../base-command';
import { genExtScaffolder } from '../../../steps/gen-ext-scaffolder';
import { FlarumProviders } from '../../../providers';
import { GenerateSearchDriverStub } from '../../../steps/stubs/backend/search-driver';
import { GenerateSearchDriverExtender } from '../../../steps/extenders/search-driver';
import { GenerateSearchDriverLocaleDefinition } from '../../../steps/js/search-driver-locale';
import { GenerateSearchDriverAbstractModelSearcherStub } from '../../../steps/stubs/backend/search-driver-searcher';
import { LocaleStep } from '../../../steps/locale/base';

export default class SearchDriver extends BaseCommand {
  static description = 'Generate a search driver';

  static flags = { ...BaseCommand.flags };

  static args = [...BaseCommand.args];

  protected steps(stepManager: StepManager<FlarumProviders>): StepManager<FlarumProviders> {
    return stepManager.atomicGroup((stepManager) => {
      stepManager
        .namedStep('driver', new GenerateSearchDriverStub(this.STUB_PATH, genExtScaffolder()))
        .step(new GenerateSearchDriverAbstractModelSearcherStub(this.STUB_PATH, genExtScaffolder()), { optional: false }, [])
        .step(
          new GenerateSearchDriverLocaleDefinition(),
          { optional: false },
          [
            {
              sourceStep: 'driver',
              exposedName: 'driverName',
            },
          ],
          {
            frontend: 'admin',
          }
        )
        .step(new LocaleStep(genExtScaffolder()), {}, [
          {
            sourceStep: 'driver',
            exposedName: 'driverName',
            consumedName: 'key',
            modifier: (driverName) => `admin.advanced.search.driver_options.${driverName}`,
          },
          {
            sourceStep: 'driver',
            exposedName: 'driverName',
            consumedName: 'value',
          },
        ])
        .step(new GenerateSearchDriverExtender(), { optional: true, confirmationMessage: 'Generate corresponding extender?', default: true }, [
          {
            sourceStep: 'driver',
            exposedName: 'class',
            consumedName: 'driverClass',
          },
        ]);
    });
  }
}
