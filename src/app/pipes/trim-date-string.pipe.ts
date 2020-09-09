import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimDateString',
})
export class TrimDateStringPipe implements PipeTransform {
  transform(dateString: string, ...args: unknown[]): string {
    return dateString.split('T', 1)[0];
  }
}
