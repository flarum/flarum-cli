import { ExtenderDef, PhpProvider } from '../src/providers/php-provider';

export function stubPhpProviderFactory(): PhpProvider {
  return {
    withExtender(extendContents: string, _extenderDef: ExtenderDef): string {
      return extendContents;
    },
    run(_command: string, _args: Record<string, any>): Record<string, any> {
      return {};
    },
  };
}
