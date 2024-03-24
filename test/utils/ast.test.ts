import { applyImports, generateCode, parseCode } from '../../src/utils/ast';

it('inserts correct default import', async () => {
  const ast = parseCode('');

  const importing = applyImports(ast, 'forum', [
    {
      name: 'Potato',
      path: 'forum/models/Potato',
      defaultImport: true,
    },
  ]);

  expect(await generateCode(ast)).toBe("import Potato from './models/Potato';\n");
  expect(importing.qualifiedModule('Potato')).toBe('Potato');
});

it('inserts correct named import', async () => {
  const ast = parseCode('');

  const importing = applyImports(ast, 'forum', [
    {
      name: 'Potato',
      path: 'forum/models/Potato',
      defaultImport: false,
    },
  ]);

  expect(await generateCode(ast)).toBe("import { Potato } from './models/Potato';\n");
  expect(importing.qualifiedModule('Potato')).toBe('Potato');
});

it('inserts correct named and default import', async () => {
  const ast = parseCode('');

  const importing = applyImports(ast, 'forum', [
    {
      name: 'Potato',
      path: 'forum/models/Potato',
      defaultImport: true,
    },
    {
      name: 'Tomato',
      path: 'forum/models/Tomato',
      defaultImport: false,
    },
  ]);

  expect(await generateCode(ast)).toBe("import { Tomato } from './models/Tomato';\nimport Potato from './models/Potato';\n");
  expect(importing.qualifiedModule('Potato')).toBe('Potato');
  expect(importing.qualifiedModule('Tomato')).toBe('Tomato');
});

it('inserts correct preferred default import', async () => {
  const ast = parseCode('');

  const importing = applyImports(ast, 'forum', [
    {
      name: 'Model',
      path: 'flarum/common/extenders/Model',
      defaultImport: true,
      preferGroupImport: true,
      useNamedGroupImport: 'Extend',
    },
  ]);

  expect(await generateCode(ast)).toBe("import Extend from 'flarum/common/extenders';\n");
  expect(importing.qualifiedModule('Model')).toBe('Extend.Model');
});

it('inserts correct preferred named import', async () => {
  const ast = parseCode('');

  const importing = applyImports(ast, 'forum', [
    {
      name: 'Model',
      path: 'flarum/common/extenders/Model',
      defaultImport: false,
      preferGroupImport: true,
    },
  ]);

  expect(await generateCode(ast)).toBe("import { Model } from 'flarum/common/extenders';\n");
  expect(importing.qualifiedModule('Model')).toBe('Model');
});

it('skips existing imports', async () => {
  const ast = parseCode(`
import Extend from 'flarum/common/extenders';
import { Tomato } from './models/Tomato';
import Potato from './models/Potato';
import { Page } from 'flarum/common/components';`);

  const importing = applyImports(ast, 'forum', [
    {
      name: 'Store',
      path: 'flarum/common/extenders/Store',
      defaultImport: true,
      preferGroupImport: true,
      useNamedGroupImport: 'Extend',
    },
    {
      name: 'Tomato',
      path: 'forum/models/Tomato',
      defaultImport: false,
    },
    {
      name: 'Potato',
      path: 'forum/models/Potato',
      defaultImport: true,
    },
    {
      name: 'Page',
      path: 'flarum/common/components/Page',
      defaultImport: true,
      preferGroupImport: true,
    },
  ]);

  expect(await generateCode(ast)).toBe(
    `import Extend from 'flarum/common/extenders';
import { Tomato } from './models/Tomato';
import Potato from './models/Potato';
import { Page } from 'flarum/common/components';\n`
  );

  expect(importing.qualifiedModule('Store')).toBe('Extend.Store');
  expect(importing.qualifiedModule('Tomato')).toBe('Tomato');
  expect(importing.qualifiedModule('Potato')).toBe('Potato');
  expect(importing.qualifiedModule('Page')).toBe('Page');
});

it('skips existing imports that are not in the preferred format', async () => {
  const ast = parseCode(`
import { Store, Search } from 'flarum/common/extenders';`);

  const module = {
    name: 'Store',
    path: 'flarum/common/extenders/Store',
    defaultImport: true,
  };

  const importing = applyImports(ast, 'forum', [module]);

  expect(await generateCode(ast)).toBe(`import { Store, Search } from 'flarum/common/extenders';\n`);
  expect(importing.qualifiedModule(module)).toBe('Store');
});
