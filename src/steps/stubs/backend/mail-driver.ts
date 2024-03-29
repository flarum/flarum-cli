import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';
import {StubGenerationSchema} from "boilersmith/steps/stub-base";

export class GenerateMailDriverStub extends BasePhpStubStep {
  type = 'Generate Mail Driver';

  additionalExposes = ['className'];

  protected schema: StubGenerationSchema = {
    recommendedSubdir: 'Mail',
    sourceFile: 'backend/mail-driver.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Mail driver class name',
        validate: Validator.className,
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      },
    ],
  };
}
