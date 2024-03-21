import { parse } from "@babel/parser";
import generate from '@babel/generator';
import {ClosureSpec, ExpressionSpec, ExpressionType, ExtenderDef, MethodCallSpec} from "../providers/php-provider";
import * as fs from "fs";
import * as t from "@babel/types";
import prettier from "prettier";
import prettierConfig from '@flarum/prettier-config/prettierrc.json';
import {MemberExpression, NewExpression} from "@babel/types";

function parseCode(code: string): t.File {
  return parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });
}

export default function addExtenders(path: string, extenders: ExtenderDef[]): void {
  const code = fs.readFileSync(path, 'utf-8');
  const ast = parseCode(code);

  const importing = applyImportsForExtenders(ast, extenders);

  // The code would contain something like:
  // const extenders = [
  //  new Extend.Routes() //
  //    .add('flags', '/flags', FlagsPage),
  // ];
  //
  // export default extenders;

  // We need to add the new extender to the array.
  // We can do this by finding the array and adding the new extender to it.
  const array = findExtendersArray(ast);

  const expressions = [];

  for (const extender of extenders) {
    const classPath = extender.extender.className;
    const className = classPath.split('/').pop() as string;

    // Before creating a newExtender, find an existing one.
    let newExtender = [...array.elements, ...expressions].find(function (element) {
      if (element?.type !== 'SequenceExpression' && element?.type !== 'CallExpression' && element?.type !== 'NewExpression') {
        return false;
      }

      let newExpression = null;

      if (element.type === 'NewExpression') {
        newExpression = element;
      } else {
        let callExpression: t.CallExpression | null = null;

        if (element.type === 'SequenceExpression') {
          callExpression = element.expressions[element.expressions.length - 1] as t.CallExpression;
        }

        if (element.type === 'CallExpression') {
          callExpression = element;
        }

        if (! callExpression) {
          return false;
        }

        if (callExpression.callee?.type === 'NewExpression') {
          newExpression = callExpression.callee as t.NewExpression;
        } else if (callExpression.callee?.type === 'MemberExpression') {
          newExpression = findNewExpressionWithinNestedMemberExpression(callExpression.callee as t.MemberExpression);
        }
      }

      if (!newExpression) {
        return false;
      }

      return (newExpression.callee as t.Identifier).name === className && sameArguments(ast, newExpression.arguments, extender.extender.args);
    }) as (t.NewExpression | t.SequenceExpression | t.CallExpression | undefined);

    const extenderExists = Boolean(newExtender);

    // Create the new extender expression.
    if (! newExtender) {
      newExtender = t.newExpression(t.identifier(importing.qualifiedModule(classPath)), extender.extender.args?.map((arg) => {
        return argumentsExpressions([arg])[0];
      }) || []);
    }

    let callExpression = null;

    // Wrap the new extender in a statement for method calls if any
    if (extender.methodCalls) {
      for (const methodCall of extender.methodCalls) {
        if (findCallExpression(newExtender, methodCall)) {
          continue;
        }

        callExpression = t.callExpression(t.memberExpression(callExpression ?? newExtender, t.identifier(methodCall.methodName)), methodCall.args ? argumentsExpressions(methodCall.args) : []);
      }
    }

    const expression = callExpression ? callExpression : newExtender;

    if (extenderExists) {
      // replace
      array.elements[array.elements.indexOf(newExtender)] = expression;
    } else {
      expressions.push(expression);
    }
  }

  array.elements.push(...expressions);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const generatedCode = generate(ast).code;

  // Format the code
  formatExtend(generatedCode).then((formattedCode: string) => {
    fs.writeFileSync(path, formattedCode);
  });
}

function applyImportsForExtenders(ast: t.File, extenders: ExtenderDef[]): { qualifiedModule: (name: string) => string } {
  const modules = extenders.map((extender) => extender.extender.className);

  modules.push(
    ...extenders.flatMap((extender) => extender.extender.args?.filter((arg) => arg.type === ExpressionType.CLASS_CONST).map((arg) => arg.value as string) || []),
    ...extenders.flatMap((extender) => extender.methodCalls?.flatMap((methodCall) => methodCall.args?.filter((arg) => arg.type === ExpressionType.CLASS_CONST).map((arg) => arg.value as string) || []) || [])
  );

  const globalImports: Record<string, t.ImportDefaultSpecifier | null> = {};
  const specificImports: Record<string, t.ImportSpecifier[] | null> = {};

  modules.forEach((module) => {
    const moduleName = module.split('/').pop() as string;
    const modulePath = module.split('/').slice(0, -1).join('/');

    let globalImportDeclaration = ((ast.program.body.find((node) => {
      return node.type === 'ImportDeclaration' && node.source.value === modulePath && node.specifiers.some((specifier) => specifier.type === 'ImportDefaultSpecifier');
    }) as t.ImportDeclaration|undefined)?.specifiers[0] ?? null) as t.ImportDefaultSpecifier|null;

    const specificImportDeclarations = (ast.program.body.find((node) => {
      return node.type === 'ImportDeclaration' && node.source.value === modulePath && node.specifiers.some((specifier) => specifier.type === 'ImportSpecifier');
    }) as t.ImportDeclaration|undefined)?.specifiers as t.ImportSpecifier[]|null;

    if (! globalImportDeclaration && ! specificImportDeclarations?.length) {
      ast.program.body.unshift(
        t.importDeclaration([t.importDefaultSpecifier(t.identifier(moduleName))], t.stringLiteral(modulePath+`/${moduleName}`))
      );

      globalImportDeclaration = t.importDefaultSpecifier(t.identifier(moduleName));
    }

    if (! globalImportDeclaration && specificImportDeclarations && specificImportDeclarations.length > 0) {
      const importedExtenders = new Set(specificImportDeclarations.map((specifier) => (specifier.imported as t.Identifier).name));
      const notImportedExtenders = extenders.filter((extender) => ! importedExtenders.has(extender.extender.className.split('/').pop() as string));

      if (notImportedExtenders.length > 0) {
        const newImports = t.importDeclaration(notImportedExtenders.map((extender) => {
          return t.importSpecifier(t.identifier(extender.extender.className.split('/').pop() as string), t.identifier(extender.extender.className.split('/').pop() as string));
        }), t.stringLiteral(modulePath));

        specificImportDeclarations.push(...newImports.specifiers as t.ImportSpecifier[]);
      }
    }

    globalImports[module] = globalImportDeclaration;
    specificImports[module] = specificImportDeclarations;
  });

  return {
    qualifiedModule(module: string) {
      const moduleName = module.split('/').pop() as string;
      const specificallyImported = specificImports[module]?.find((specifier) => (specifier.imported as t.Identifier).name === moduleName);

      if (specificallyImported) {
        return specificallyImported.local.name;
      }

      const globalImportDeclaration = globalImports[module];

      return `${globalImportDeclaration!.local.name}.${moduleName}`;
    }
  };
}

function findExtendersArray(ast: t.File): t.ArrayExpression {
  let defaultExport = ast.program.body.find((node) => {
    return node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ArrayExpression';
  }) as t.ExportDefaultDeclaration;

  if (!defaultExport) {
    ast.program.body.push(defaultExport = t.exportDefaultDeclaration(t.arrayExpression([])));
  }

  return defaultExport.declaration as t.ArrayExpression;
}

function findNewExpressionWithinNestedMemberExpression(memberExpression: MemberExpression): NewExpression|null {
  if (memberExpression.object.type === 'NewExpression') {
    return memberExpression.object as t.NewExpression;
  }

  if (memberExpression.object.type === 'CallExpression' && memberExpression.object.callee.type === 'MemberExpression') {
    return findNewExpressionWithinNestedMemberExpression(memberExpression.object.callee as t.MemberExpression);
  }

  return null;
}

function findCallExpression(newExtender: t.NewExpression | t.SequenceExpression | t.CallExpression, methodCall: MethodCallSpec): boolean {
  if (newExtender.type === 'NewExpression' || newExtender.type === 'SequenceExpression') {
    return false;
  }

  let found = newExtender.type === 'CallExpression'
    && newExtender.callee.type === 'MemberExpression'
    && newExtender.callee.property.type === 'Identifier'
    && newExtender.callee.property.name === methodCall.methodName
    && JSON.stringify(newExtender.arguments.map((arg) => (arg as t.StringLiteral).value)) === JSON.stringify((methodCall.args || []).map((arg) => arg.value));

  if (! found && newExtender.callee.type === 'MemberExpression' && newExtender.callee.object.type === 'CallExpression') {
    found = findCallExpression(newExtender.callee.object, methodCall);
  }

  return found;
}

function argumentsExpressions(args: ExpressionSpec[]): Array<t.Expression> {
  return args.map((arg) => {
    switch (arg.type) {
      case ExpressionType.SCALAR:
        return t.stringLiteral(arg.value as string);
      case ExpressionType.CLASS_CONST:
        return t.identifier((arg.value as string).split('/').pop() as string);
      case ExpressionType.CLOSURE:
        return t.arrowFunctionExpression((arg.value as ClosureSpec).params.map((param) => t.identifier(param.name)), t.blockStatement([]));
      // case ExpressionType.VARIABLE:
      default:
        return t.identifier(arg.value as string);
    }
  });
}

function sameArguments(ast: t.File, usedArguments: Array<t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder>, extenderArgs: ExpressionSpec[] | undefined) {
  const argumentValues = usedArguments
    .map((arg) => {
      if (arg.type === 'StringLiteral') {
        return arg.value;
      }

      // return full module path
      if (arg.type === 'Identifier') {
        const path = (ast.program.body.find((node) => {
          return node.type === 'ImportDeclaration' && node.specifiers.some((specifier) => specifier.local.name === arg.name);
        }) as t.ImportDeclaration|undefined)?.source.value;

        return path ? `${path}/${arg.name}` : arg.name;
      }

      return null;
    }).filter((value) => value !== null);

  const configuredArgs = extenderArgs?.map((arg) => arg.value) || [];

  return JSON.stringify(argumentValues) === JSON.stringify(configuredArgs);
}

function formatExtend(code: string): Promise<string> {
  return prettier.format(code, { ...(prettierConfig as prettier.Options), parser: 'babel', printWidth: 100 });
}
