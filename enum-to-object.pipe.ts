import { Pipe, PipeTransform } from '@angular/core';
import { enumToObject } from '../helpers';

@Pipe({
  name: 'enumToObject',
  pure: true
})
export class EnumToObjectPipe implements PipeTransform {
  transform(enumDefinition: any): object {
    return enumToObject(enumDefinition);
  }
}
