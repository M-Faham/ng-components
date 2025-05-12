import { RegexKeys } from './regex-keys';

export const PATTERNS: Record<RegexKeys, RegExp> = {
  NUMBER: /^[0-9]*$/,
  DECIMAL: /^[0-9]+(\.[0-9]+)?$/,
  FLOAT_NUMBER: /^[+]?\d*\.?\d+$/,
  USERNAME: /^[a-zA-Z0-9]*$/,
  SAUDI_IBAN: /^SA\d{4}[0-9]{18}$/,
  WEB_URL: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/,

  POSITIVE_INTEGER: /^\d+$/,
  INTEGER: /^-?\d+$/,

  CONTAINS_SPECIAL_CHARACTERS: /[!@#$%^&*(),.?":{}|<>_/^\\[\]\-+=']/,
  CONTAINS_UPPERCASE_AND_LOWERCASE: /^(?=.*[a-z])(?=.*[A-Z]).+$/,
  CONTAINS_NUMBER: /\d/,

  EnglishOnly: /^[a-zA-Z0-9 ]*$/,
  ArabicOnly: /^[\u0621-\u064A0-9 ]*$/,
  ArabicAndEnglishOnly: /^[a-zA-Z0-9 \u0621-\u064A ]*$/,

  PASSWORD:
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_/^\\[\]\-+=']).{8,}$/,

  NATIONAL_ID: /^[1-2]\d{9}$/,
  NoSepcialCharacters: /^[a-zA-Z0-9]*$/,

  SUADI_MOBILE: /^(009665|9665|[+]9665|05)([0-9]{8})$/,
  SUADI_MOBILE_NO_COUNTRY: /^(5)([0-9]{8})$/,

  IQAMA_OR_NATIONAL_ID: /^[12][0-9]{9}$/,

  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};
