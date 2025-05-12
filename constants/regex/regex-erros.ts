import { RegexKeys } from './regex-keys';

export const PATTERNS_ERRORS: Record<RegexKeys, string> = {
  NUMBER: 'errors.patterns.number',
  DECIMAL: 'errors.patterns.decimal',
  FLOAT_NUMBER: 'errors.patterns.floating_number',
  USERNAME: 'errors.patterns.username',
  PASSWORD: 'errors.patterns.week_password',
  NATIONAL_ID: 'errors.patterns.national_no',
  IQAMA_OR_NATIONAL_ID: 'errors.patterns.iqama_or_national_no',
  CONTAINS_SPECIAL_CHARACTERS:
    'errors.patterns.contains_special_characters',
  CONTAINS_UPPERCASE_AND_LOWERCASE:
    'errors.patterns.contains_uppercase_and_lowercase',
  CONTAINS_NUMBER: 'errors.patterns.contains_number',
  NoSepcialCharacters: 'errors.patterns.no_sepcial_characters',
  EnglishOnly: 'errors.patterns.english_only',
  ArabicOnly: 'errors.patterns.arabic_only',
  ArabicAndEnglishOnly: 'errors.patterns.arabic_and_english_only',
  SUADI_MOBILE: 'errors.patterns.invalid_saudi_phone',
  SUADI_MOBILE_NO_COUNTRY: 'errors.patterns.invalid_saudi_phone',
  SAUDI_IBAN: 'errors.patterns.iban',
  POSITIVE_INTEGER: 'errors.patterns.positiveInteger',
  INTEGER: 'errors.patterns.integer',
  WEB_URL: 'errors.patterns.invalid_web_url',
  EMAIL: 'errors.patterns.invalid_email'
};
