export function enumToObject(enumDefinition: any): object {
  const enumObject: { [key: string]: number } = {};
  for (const key in enumDefinition) {
    if (isNaN(Number(key))) {
      enumObject[key] = enumDefinition[key];
    }
  }

  return enumObject;
}
