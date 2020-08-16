import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  private context = new Subject<{
    start?: Date;
    end?: Date;
    search?: string;
  }>();

  public context$: Observable<{
    start?: Date;
    end?: Date;
    search?: string;
  }> = this.context.asObservable();

  public setContext(startDate?: Date, endDate?: Date, searchValue?: string) {
    this.context.next({ start: startDate, end: endDate, search: searchValue });
  }
}
