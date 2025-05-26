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
    const sortedEntries = Object.entries(value).sort(
      ([keyA, valueA], [keyB, valueB]) => {
        if (order === 'asc') {
          return valueB > valueA ? 1 : -1;
        } else {
          return valueA > valueB ? 1 : -1;
        }
      }
    );
    return sortedEntries.map(([key, val]) => ({ key, value: val }));
  }
}
