import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortedKeyValue'
})
export class SortedKeyValuePipe implements PipeTransform {
  transform(
    value: Record<string, any>,
    order: 'asc' | 'desc' = 'desc'
  ): { key: string; value: any }[] {
    if (!value || typeof value !== 'object') {
      return [];
    }
    const sortedEntries = Object.entries(value).sort(([keyA], [keyB]) => {
      if (order === 'asc') {
        return keyA.localeCompare(keyB);
      } else {
        return keyB.localeCompare(keyA);
      }
    });

    return sortedEntries.map(([key, val]) => ({ key, value: val }));
  }
}
