import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContextService {
  private context = new BehaviorSubject<{
    start?: Date;
    end?: Date;
    search?: string;
  }>({});

  private isSmallScreenContext = new BehaviorSubject<boolean>(true);

  public context$: Observable<{
    start?: Date;
    end?: Date;
    search?: string;
  }> = this.context.asObservable();

  public isSmallScreenContext$: Observable<
    boolean
  > = this.isSmallScreenContext.asObservable();

  public setStartDateContext(startDate: Date) {
    let currentContext: any = this.context.getValue();
    this.context.next({
      start: startDate,
      end: currentContext.end,
      search: currentContext.search,
    });
  }

  public setEndDateContext(endDate: Date) {
    let currentContext: any = this.context.getValue();
    this.context.next({
      start: currentContext.start,
      end: endDate,
      search: currentContext.search,
    });
  }

  public setSearchValueContext(searchValue: string) {
    let currentContext: any = this.context.getValue();
    this.context.next({
      start: currentContext.start,
      end: currentContext.end,
      search: searchValue,
    });
  }

  public setSmallScreenContext(isSmallScreen: boolean) {
    this.isSmallScreenContext.next(isSmallScreen);
  }
}
