import { Component, OnInit, OnDestroy } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { FeedService } from '../service/feed.service';
import { Article } from '../models/article';
import { ContextService } from '../service/context.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
})
export class FeedComponent implements OnInit, OnDestroy {
  public isLoading: boolean = true;
  public articles: Article[] = [];

  private startDate?: Date;
  private endDate?: Date;
  private contextSubscription$?: Subscription;

  constructor(
    private contextService: ContextService,
    private feedService: FeedService
  ) {}

  public ngOnInit(): void {
    this.loadArticles();

    this.contextSubscription$ = this.contextService.context$
      .pipe(debounceTime(1000))
      .subscribe((context) => {
        if (this.startDate !== context.start || this.endDate !== context.end) {
          this.startDate = context.start;
          this.endDate = context.end;
          this.loadArticles(this.startDate, this.endDate);
        }
      });
  }

  public ngOnDestroy(): void {
    if (this.contextSubscription$) {
      this.contextSubscription$.unsubscribe();
    }
  }

  public openLink(url: string) {
    window.open(url, '_blank');
  }

  private loadArticles(startDate?: Date, endDate?: Date): void {
    this.feedService
      .getArticles(startDate, endDate)
      .toPromise()
      .then((articles) => (this.articles = articles))
      .finally(() => (this.isLoading = false));
  }
}
