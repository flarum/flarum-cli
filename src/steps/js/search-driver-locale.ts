import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { BaseJsStep, InitializerDefinition } from './base';

export class GenerateSearchDriverLocaleDefinition extends BaseJsStep {
  type = 'Generate Search Driver Locale Definition';

  protected schema = null;

  protected async getDefinition(frontend: string, _paths: Paths, io: IO): Promise<InitializerDefinition | null> {
    if (frontend !== 'admin') {
      return null;
    }

    const driverName: string = await io.getParam({ name: 'driverName', message: 'Unique driver name', type: 'text' });

    return {
      code: `
        extend(AdvancedPage.prototype, 'driverLocale', function (locale) {
          locale.search['${driverName}'] = app.translator.trans('${this.params.extensionId}.admin.advanced.search.driver_options.${driverName}', {}, true);
        });`,
      imports: [
        {
          name: 'AdvancedPage',
          path: 'flarum/admin/components/AdvancedPage',
          defaultImport: true,
        },
        {
          name: 'extend',
          path: 'flarum/common/extend',
          defaultImport: false,
        },
      ],
    };
  }
}
