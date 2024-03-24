import { Validator } from '../../../utils/validation';
import { BasePhpStubStep } from '../php-base';

export class GenerateSearchDriverAbstractModelSearcherStub extends BasePhpStubStep {
  type = 'Generate Search Driver abstract model searcher class';

  protected additionalExposes = [];

  protected phpClassParams = [];

  protected schema = {
    recommendedSubdir: 'Search',
    sourceFile: 'backend/search/searcher.php',
    params: [
      {
        name: 'className',
        type: 'text',
        message: 'Driver model searcher abstract class name',
        validate: Validator.className,
        initial: 'Searcher',
      },
      {
        name: 'classNamespace',
        type: 'text',
        message: 'Class Namespace',
      }
    ],
  };
}
