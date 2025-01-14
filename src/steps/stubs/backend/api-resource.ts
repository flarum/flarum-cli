import chalk from 'chalk';
import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { Validator } from '../../../utils/validation';
import { pluralKebabCaseModel } from '../../../utils/model-name';
import { BasePhpStubStep } from '../php-base';
import { Store } from 'mem-fs';

export class GenerateApiResourceStub extends BasePhpStubStep {
  type = 'Generate Api Resource Class';

  protected additionalExposes = ['className', 'modelClass', 'modelClassName', 'modelType'];

  protected additionalImplicitParams = ['modelType'];

  protected phpClassParams = ['modelClass'];

  protected schema = {
    recommendedSubdir: 'Api/Resource',
    sourceFile: 'backend/api-resource.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Resource class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'modelClass',
        type: 'text',
        message: `Model Class (${chalk.dim('Vendor\\Path\\Model')})`,
        validate: Validator.class,
      },
      {
        name: 'modelClassName',
        type: 'text',
        message: 'Model class name',
      },
      {
        name: 'modelType',
        type: 'text',
        message: 'Model type',
      },
    ],
  };

  protected async compileParams(fs: Store, paths: Paths, io: IO): Promise<Record<string, unknown>> {
    const params = await super.compileParams(fs, paths, io);

    params.modelType = pluralKebabCaseModel(params.modelClassName as string);

    return params;
  }
}
