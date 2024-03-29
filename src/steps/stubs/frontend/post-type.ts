import { Validator } from '../../../utils/validation';
import { BaseJsStubStep } from '../js-base';
import { StubGenerationSchema } from 'boilersmith/steps/stub-base';
import {Store} from "mem-fs";
import {IO} from "boilersmith/io";
import {Paths} from "boilersmith/paths";
import s from "string";

export class GeneratePostTypeStub extends BaseJsStubStep {
  type = 'Generate a new post type component';

  protected additionalExposes = ['frontend', 'classNamespace', 'postType'];

  protected schema: StubGenerationSchema = {
    recommendedSubdir: 'forum/components',
    sourceFile: 'frontend/post-type.js',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Post Type class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'postType',
        message: 'Notification type',
        type: 'text',
        initial: (_prev, params): string => {
          return s(params.get('className') as string).underscore().toString().replace(/_post$/, '');
        }
      },
    ],
  };

  protected async precompileParams(fs: Store, paths: Paths, io: IO): Promise<Record<string, unknown>> {
    const params = await super.precompileParams(fs, paths, io);

    params.frontend = 'forum';

    return params;
  }
}
