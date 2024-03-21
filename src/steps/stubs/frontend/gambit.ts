import { Validator } from '../../../utils/validation';
import { BaseJsStubStep } from '../js-base';
import {StubGenerationSchema} from "boilersmith/steps/stub-base";

export class GenerateGambitStub extends BaseJsStubStep {
  type = 'Generate a Gambit';

  protected additionalExposes = ['frontend', 'classNamespace'];

  protected schema: StubGenerationSchema = {
    recommendedSubdir: 'common/gambits',
    sourceFile: 'frontend/gambit/${type}.js',
    params: [
      {
        name: 'frontend',
        type: 'text',
        message: 'Frontend name (common recommended)',
      },
      {
        name: 'className',
        type: 'text',
        message: 'Gambit class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
      {
        name: 'type',
        message: 'Gambit type',
        type: 'select',
        choices: ['boolean', 'key-value'].map((type) => ({
          title: type,
          value: type
        })),
      },
      {
        name: 'filterKey',
        message: 'Backend filter key',
        type: 'text',
        validate: Validator.alphaNumeric
      },
    ],
  };
}
