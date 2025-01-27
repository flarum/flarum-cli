type ValidatorFunc = true | string;

export class Validator {
  public static class(s: string): ValidatorFunc {
    return /^([\dA-Za-z]+)(\\([\dA-Za-z]+))*$/.test(s.trim()) || 'Invalid PHP class. Must be qualified, but not fully qualified.';
  }

  public static optionalClass(s: string): ValidatorFunc {
    return s.length === 0 || Validator.class(s);
  }

  public static className(s: string): ValidatorFunc {
    return /^([\dA-Za-z]+)$/.test(s.trim()) || 'Invalid PHP class name: only alphanumerical characters allowed.';
  }

  public static module(s: string): ValidatorFunc {
    return /^([\dA-Za-z]+)(\/([\dA-Za-z]+))*$/.test(s.trim()) || 'Invalid JS module. Must be fully qualified.';
  }

  public static routeName(s: string): ValidatorFunc {
    return /^([\d.A-z-]+)$/.test(s.trim()) || 'Invalid path name: only alphanumerical characters allowed and (._-).';
  }

  public static alphaNumeric(s: string): ValidatorFunc {
    return /^[\w-]+$/.test(s.trim()) || 'Field is required; alphanumerical characters and dashes only!';
  }

  public static commandName(s: string): ValidatorFunc {
    return /^([\d.:A-z-]+)$/.test(s.trim()) || 'Invalid path name: only alphanumerical characters allowed and (._-:).';
  }

  public static migrationName(s: string): ValidatorFunc {
    return /^\w+$/.test(s.trim()) || 'Field is required; alphanumerical characters, underscores, and spaces only!';
  }

  public static tableName(s: string): ValidatorFunc {
    return /^[\w$,]{0,64}$/.test(s.trim()) || 'Invalid table name, must be less than 64 alphanumerical characters.';
  }

  public static modelType(s: string): ValidatorFunc {
    return /^[\w-]+$/.test(s.trim()) || 'Field is required; alphanumerical characters, dashes, and underscores only!';
  }

  public static fileName(s: string): ValidatorFunc {
    return /^[\w-]+$/.test(s.trim()) || 'Field is required; alphanumerical characters, dashes, and underscores only!';
  }

  public static gitRepo(s: string): ValidatorFunc {
    return /^((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w./:@~-]+)(\.git)(\/)?$/.test(s.trim()) || 'Invalid git repo URL.';
  }

  public static alphaDash(s: string): ValidatorFunc {
    return /^[\w-]+$/.test(s.trim()) || 'Field is required; alphanumerical characters and dashes only!';
  }
}
