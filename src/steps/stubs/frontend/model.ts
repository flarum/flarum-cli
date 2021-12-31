/* eslint-disable no-template-curly-in-string */
import { Editor } from 'mem-fs-editor';
import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { Validator } from '../../../utils/validation';
import { BaseJsStubStep } from '../js-base';
import { pluralKebabCaseModel } from '../../../utils/model-name';

export class GenerateModelStub extends BaseJsStubStep {
  type = 'Generate Model Class';

  protected additionalExposes = ['frontend', 'modelType', 'classNamespace'];

  protected schema = {
    recommendedSubdir: '${frontend}/models',
    sourceFile: 'frontend/model.js',
    params: [
      {
        name: 'frontend',
        type: 'text',
        message: 'Frontend name',
      },
      {
        name: 'className',
        type: 'text',
        message: 'Model class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
      },
    ],
  }

  protected async compileParams(fsEditor: Editor, paths: Paths, io: IO): Promise<Record<string, unknown>> {
    const params = await super.compileParams(fsEditor, paths, io);

    params.modelType = pluralKebabCaseModel(params.className as string);

    return params;
  }
}
