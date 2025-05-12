export function getEnumKeyByValue(
  enumValue: number,
  enumDefinition: any
): string {
  const keys = Object.keys(enumDefinition).filter(
    (x) => enumDefinition[x] === enumValue
  );
  return keys.length > 0 ? keys[0] : '';
}
