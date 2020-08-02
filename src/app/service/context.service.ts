import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  private context = new Subject<{ start?: Date; end?: Date }>();

  public context$: Observable<{
    start?: Date;
    end?: Date;
  }> = this.context.asObservable();

  public setDateRange(startDate?: Date, endDate?: Date) {
    this.context.next({ start: startDate, end: endDate });
  }
}
