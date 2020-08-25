import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  private context = new BehaviorSubject<{
    feedType: number;
    start?: Date;
    end?: Date;
    search?: string;
  }>({ feedType: 0 });

  public context$: Observable<{
    feedType: number;
    start?: Date;
    end?: Date;
    search?: string;
  }> = this.context.asObservable();

  public setContext(startDate?: Date, endDate?: Date, searchValue?: string) {
    let currentContext: any = this.context.getValue();
    this.context.next({
      feedType: currentContext.feedType,
      start: startDate,
      end: endDate,
      search: searchValue,
    });
  }

  public setFeedType(index: number) {
    let currentContext: any = this.context.getValue();
    this.context.next({
      feedType: index,
      start: currentContext.start,
      end: currentContext.end,
      search: currentContext.search,
    });
  }
}
