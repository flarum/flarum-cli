import { ExpressionType, ExtenderDef } from '../providers/php-provider';
import * as fs from 'fs';
import * as t from '@babel/types';
import {
  applyImports,
  argumentsExpressions,
  findCallExpression,
  findNewExpressionWithinNestedMemberExpression,
  generateCode,
  ModuleImport,
  parseCode,
  sameArguments,
} from './ast';

export default function addExtenders(path: string, extenders: ExtenderDef[], frontend: string): void {
  const code = fs.readFileSync(path, 'utf-8');
  const ast = parseCode(code);

  const importing = applyImportsForExtenders(ast, extenders, frontend);

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

        if (!callExpression) {
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

      const sameName =
        newExpression.callee.type === 'MemberExpression'
          ? (newExpression.callee.property as t.Identifier).name === className
          : (newExpression.callee as t.Identifier).name === className;

      return sameName && sameArguments(ast, newExpression.arguments, extender.extender.args);
    }) as t.NewExpression | t.SequenceExpression | t.CallExpression | undefined;

    const extenderExists = Boolean(newExtender);

    // Create the new extender expression.
    if (!newExtender) {
      newExtender = t.newExpression(
        t.identifier(importing.qualifiedModule(classPath)),
        extender.extender.args?.map((arg) => {
          return argumentsExpressions([arg])[0];
        }) || []
      );
    }

    let callExpression = null;

    // Wrap the new extender in a statement for method calls if any
    if (extender.methodCalls) {
      for (const methodCall of extender.methodCalls) {
        if (findCallExpression(newExtender, methodCall)) {
          continue;
        }

        callExpression = t.callExpression(
          t.memberExpression(callExpression ?? newExtender, t.identifier(methodCall.methodName)),
          methodCall.args ? argumentsExpressions(methodCall.args) : []
        );
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

  generateCode(ast).then((formattedCode: string) => fs.writeFileSync(path, formattedCode));
}

function applyImportsForExtenders(
  ast: t.File,
  extenders: ExtenderDef[],
  frontend: string
): { qualifiedModule: (name: string | ModuleImport) => string } {
  const modules = extenders.map((extender) => extender.extender.className);

  modules.push(
    ...extenders.flatMap(
      (extender) => extender.extender.args?.filter((arg) => arg.type === ExpressionType.CLASS_CONST).map((arg) => arg.value as string) || []
    ),
    ...extenders.flatMap(
      (extender) =>
        extender.methodCalls?.flatMap(
          (methodCall) => methodCall.args?.filter((arg) => arg.type === ExpressionType.CLASS_CONST).map((arg) => arg.value as string) || []
        ) || []
    )
  );

  return applyImports(
    ast,
    frontend,
    modules.map((module) => {
      return {
        name: module.split('/').pop()!,
        path: module,
        defaultImport: true,
      };
    })
  );
}

function findExtendersArray(ast: t.File): t.ArrayExpression {
  let defaultExport = ast.program.body.find((node) => {
    return node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'ArrayExpression';
  }) as t.ExportDefaultDeclaration;

  if (!defaultExport) {
    ast.program.body.push((defaultExport = t.exportDefaultDeclaration(t.arrayExpression([]))));
  }

  return defaultExport.declaration as t.ArrayExpression;
}
