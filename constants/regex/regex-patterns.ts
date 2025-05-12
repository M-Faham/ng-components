import { AbstractControl, ValidationErrors } from '@angular/forms';
import { PATTERNS_ERRORS } from './regex-errros';
import { RegexKeys } from './regex-keys';
import { PATTERNS } from './regex-values';

export const REGEX_PATTERNS: Record<
  RegexKeys,
  { regex: RegExp; error: string }
> = Object.keys(PATTERNS).reduce(
  (acc, key) => {
    const regexKey = key as RegexKeys;
    acc[regexKey] = {
      regex: PATTERNS[regexKey],
      error: PATTERNS_ERRORS[regexKey]
    };
    return acc;
  },
  {} as Record<RegexKeys, { regex: RegExp; error: string }>
);

export function patternValidator(validator: { regex: RegExp; error: string }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const valid = validator.regex.test(control.value);
    return valid ? null : { pattern: validator.error };
  };
}
