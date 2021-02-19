import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'domain'
})
export class DomainPipe implements PipeTransform {

  transform(domain: string): string {
    return `https://${domain}.d3.ru/`;
  }

}
