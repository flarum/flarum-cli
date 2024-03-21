import { IO } from 'boilersmith/io';
import { Paths } from 'boilersmith/paths';
import { Validator } from '../../../utils/validation';
import { BaseJsStubStep } from '../js-base';
import { Store } from 'mem-fs';
import {kebab, pluralKebabCaseModel} from "../../../utils/model-name";

export class GenerateForumPageStub extends BaseJsStubStep {
  type = 'Generate Forum Page Class';

  protected additionalExposes = ['frontend', 'classNamespace'];

  protected schema = {
    recommendedSubdir: 'forum/components',
    sourceFile: 'frontend/forum-page.js',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Forum page module',
        validate: Validator.module,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
    ],
  };

  protected async compileParams(fs: Store, paths: Paths, io: IO): Promise<Record<string, unknown>> {
    const params = await super.compileParams(fs, paths, io);

    params.frontend = 'forum';
    params.pathName = kebab(params.className as string);

    return params;
  }
}
