import { getFsPaths, runStep } from '../../boilersmith/utils';

import { GenerateApiSerializerAttributesExtender } from '../../../src/steps/extenders/api-serializer';
import { GenerateEventListenerExtender } from '../../../src/steps/extenders/event';
import { GenerateRoutesExtender } from '../../../src/steps/extenders/route';
import { GenerateServiceProviderExtender } from '../../../src/steps/extenders/service-provider';
import { GeneratePolicyExtender } from '../../../src/steps/extenders/policy';
import { GenerateConsoleCommandExtender } from '../../../src/steps/extenders/console-command';
import { FlarumProviders } from '../../../src/providers';
import { Step } from '../../../src/boilersmith/step-manager';
import { Paths } from 'boilersmith/paths';
import {stubPhpProviderFactory} from '../../utils'

interface ExtenderTest {
  extenderClass: new () => Step<FlarumProviders>;

  params: Record<string, unknown>;
}

const requestedDir = '/ext/src/somePath';

const testSpecs: ExtenderTest[] = [
  // Event Listener
  {
    extenderClass: GenerateEventListenerExtender,
    params: {
      eventClass: 'Flarum\\Post\\Event\\Saving',
      listenerClass: 'Flarum\\Demo\\Listener\\SaveToDb',
    },
  },
  // API Attributes
  {
    extenderClass: GenerateApiSerializerAttributesExtender,
    params: {
      serializerClass: 'Flarum\\Api\\Serializer\\UserSerializer',
      modelClass: 'Flarum\\User\\User',
    },
  },
  // Route
  {
    extenderClass: GenerateRoutesExtender,
    params: {
      routePath: '/potatoes',
      routeName: 'potatoes.index',
      routeHandler: 'Flarum\\Demo\\Api\\Controller\\ListPotatoesController',
    },
  },
  // Service Provider
  {
    extenderClass: GenerateServiceProviderExtender,
    params: {
      className: 'CustomServiceProvider',
    },
  },
  // Policy
  {
    extenderClass: GeneratePolicyExtender,
    params: {
      modelClass: 'Flarum\\CustomModel\\CustomModel',
      policyClass: 'Flarum\\Access\\CustomModelPolicy',
    },
  },
  // Console Command
  {
    extenderClass: GenerateConsoleCommandExtender,
    params: {
      commandClass: 'Flarum\\Console\\CustomCommand',
    },
  },
];

describe('Extender tests', function () {
  for (const spec of testSpecs) {
    test(`Extender test: ${spec.extenderClass.name}`, async function () {
      const initialFilesCallback = (paths: Paths) => {
        const initial: Record<string, string> = {};
        initial[paths.package('extend.php')] = `<?php

return [];
`;
        return initial;
      };

      const { fs } = await runStep(new spec.extenderClass(), {php: stubPhpProviderFactory()}, Object.values(spec.params), {}, initialFilesCallback, requestedDir);

      expect(getFsPaths(fs)).toStrictEqual(['/ext/extend.php'].sort());
    });
  }
});
