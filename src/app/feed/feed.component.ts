import { Component, OnInit, OnDestroy } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { FeedService } from '../service/feed.service';
import { Article } from '../models/article';
import { ContextService } from '../service/context.service';
import { Subscription } from 'rxjs';
import { Util } from '../util';
import { BookmarkService } from '../service/bookmark.service';
import { Bookmark } from '../models/bookmark';
import { TrimDateStringPipe } from '../pipes/trim-date-string.pipe';

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
    private bookmarkService: BookmarkService,
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

  public toogleBookmark(article: Article): void {
    if (article.bookmarked) {
      article.bookmarked = false;
      this.bookmarkService.removeArticle(article._id);
    } else {
      article.bookmarked = true;
      this.bookmarkService.addArticle(article);
    }
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
      .toPromise()
      .then((articles) => {
        this.setBookmarks(articles);

        if (append) {
          this.articles = this.articles.concat(articles);
        } else {
          this.articles = articles;
        }
        this.offset = this.articles.length;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => (this.isLoading = false));
  }

  private setBookmarks(articles: Article[]): void {
    const bookmarks: Bookmark[] = this.bookmarkService.getBookmarks();

    articles.forEach((article) => {
      const index: number = bookmarks.findIndex(
        (i) => i._id === article._id && !i.isVideo
      );
      if (index >= 0) {
        article.bookmarked = true;
      }
    });
  }
}
