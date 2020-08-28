import { Component, OnInit, OnDestroy } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { FeedService } from '../service/feed.service';
import { Article } from '../models/article';
import { ContextService } from '../service/context.service';
import { Subscription } from 'rxjs';
import { Util } from '../util';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  public isLoading: boolean = true;
  public articles: Article[] = [];
  public isSmallScreen: boolean = true;

  private startDate?: Date;
  private endDate?: Date;
  private searchValue?: string;
  private offset: number = 0;
  private contextSubscription$?: Subscription;
  private isSmallScreenContextSubscription$?: Subscription;

  constructor(
    private contextService: ContextService,
    private feedService: FeedService
  ) {
    this.isSmallScreenContextSubscription$ = this.contextService.isSmallScreenContext$.subscribe(
      (isSmallScreen) => {
        if (this.isSmallScreen !== isSmallScreen) {
          this.isSmallScreen = isSmallScreen;
        }
      }
    );

    this.contextSubscription$ = this.contextService.context$
      .pipe(debounceTime(500))
      .subscribe((context) => {
        if (
          this.startDate !== context.start ||
          this.endDate !== context.end ||
          this.searchValue !== context.search
        ) {
          this.startDate = context.start;
          this.endDate = context.end;
          this.searchValue = context.search;
          this.loadArticles(
            this.offset,
            false,
            this.startDate,
            this.endDate,
            this.searchValue
          );
        }
      });
  }

  public ngOnInit(): void {
    this.loadArticles(this.offset);
  }

  public ngOnDestroy(): void {
    if (this.contextSubscription$) {
      this.contextSubscription$.unsubscribe();
    }
    if (this.isSmallScreenContextSubscription$) {
      this.isSmallScreenContextSubscription$.unsubscribe();
    }
  }

  public openLink(url: string): void {
    window.open(url, '_blank');
  }

  public onScroll(): void {
    this.loadArticles(
      this.offset,
      true,
      this.startDate,
      this.endDate,
      this.searchValue
    );
  }

  public getLabel(name: string): string {
    return Util.getLabel(name, this.isSmallScreen);
  }

  private loadArticles(
    offset: number,
    append?: boolean,
    startDate?: Date,
    endDate?: Date,
    searchValue?: string
  ): void {
    this.isLoading = true;
    this.feedService
      .getArticles(offset, startDate, endDate, searchValue)
      // .getMockArticles()
      .toPromise()
      .then((articles) => {
        if (append) {
          this.articles = this.articles.concat(articles);
        } else {
          this.articles = articles;
        }
        this.offset = this.articles.length;
      })
      .finally(() => (this.isLoading = false));
  }
}
