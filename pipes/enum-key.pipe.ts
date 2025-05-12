import { Pipe, PipeTransform } from '@angular/core';
import { getEnumKeyByValue } from '../helpers';

@Pipe({
  name: 'enumKey',
  pure: true
})
export class EnumKeyPipe implements PipeTransform {
  transform(enumValue: any, enumDefinition: any): string {
    return getEnumKeyByValue(enumValue, enumDefinition);
  }
}
