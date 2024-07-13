import { execSync } from 'child_process';

type Scalar = string | boolean | number;

export interface ExtenderDef {
  extender: ExtenderSpec;
  methodCalls?: MethodCallSpec[];
}

export interface ExtenderSpec {
  className: string;
  args?: ExpressionSpec[];
}

export interface MethodCallSpec {
  methodName: string;
  args?: ExpressionSpec[];
}

export interface ExpressionSpec {
  type: ExpressionType;
  value: Scalar | Array<Scalar> | ClosureSpec | ((params: any) => Scalar | Array<Scalar>);
  auxiliaryValue?: string;
}

export interface ClosureSpec {
  params: ParamSpec[];
  commentText?: string; // This will be put in as a string expression, since PHP parser can't insert comments easily.
  return?: ExpressionSpec;
}

export interface ParamSpec {
  typeType: ParamTypeType;
  type: string;
  name: string;
}

export enum ExpressionType {
  SCALAR = 'scalar',
  CLASS_CONST = 'class_const',
  CLOSURE = 'closure',
  VARIABLE = 'variable',
}

export enum ParamTypeType {
  CLASS = 'class',
  PRIMITIVE = 'primitive',
}

export interface PhpProvider {
  withExtender(extendContents: string, extenderDef: ExtenderDef): string;
  run(command: string, args: Record<string, any>): string;
}

export class PhpSubsystemProvider implements PhpProvider {
  protected phpPath: string;

  constructor(phpPath: string) {
    this.phpPath = phpPath;
  }

  withExtender(extendContents: string, extenderDef: ExtenderDef): string {
    const input = JSON.stringify({
      'extend.php': extendContents,
      op: 'extender.add',
      params: extenderDef,
    });

    const res = execSync(`php ${this.phpPath}`, { input });

    if (!res) {
      throw new Error(`The PHP subsystem returned an invalid value: ${res}`);
    }

    return res.toString();
  }

  run(command: string, args: Record<string, any>): string {
    const input = JSON.stringify({
      op: command,
      ...args,
    });

    const res = execSync(`php ${this.phpPath}`, { input });

    if (!res) {
      throw new Error(`The PHP subsystem returned an invalid value: ${res}`);
    }

    return res.toString();
  }
}
