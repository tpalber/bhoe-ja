import { Component, OnInit, OnDestroy } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { FeedService } from '../service/feed.service';
import { Article } from '../models/article';
import { ContextService } from '../service/context.service';
import { Subscription } from 'rxjs';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';

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
  private windowSubscription$?: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private contextService: ContextService,
    private feedService: FeedService
  ) {}

  public ngOnInit(): void {
    this.windowSubscription$ = this.breakpointObserver
      .observe([Breakpoints.Web, Breakpoints.WebLandscape])
      .subscribe((state: BreakpointState) => {
        if (
          state.breakpoints[Breakpoints.Web] ||
          state.breakpoints[Breakpoints.WebLandscape]
        ) {
          this.isSmallScreen = false;
        }
      });

    this.loadArticles(this.offset);

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

  public ngOnDestroy(): void {
    if (this.windowSubscription$) {
      this.windowSubscription$.unsubscribe();
    }
    if (this.contextSubscription$) {
      this.contextSubscription$.unsubscribe();
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
