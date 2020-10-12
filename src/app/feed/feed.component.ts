import { Component, OnDestroy, OnInit } from '@angular/core';
import { FeedService } from '../service/feed.service';
import { Article, Bookmark } from '../models';
import { Subscription } from 'rxjs';
import { Util } from '../util';
import { LocalStorageService } from '../service/local-storage.service';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {
  public isLoading: boolean = true;
  public isSmallScreen: boolean = true;
  public articles: Article[] = [];

  private inTibetan: boolean = false;
  private startDate?: Date;
  private endDate?: Date;
  private searchValue?: string;
  private sourceFilters?: string[];
  private offset: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private storageService: LocalStorageService,
    private feedService: FeedService,
    private store: Store<AppState>
  ) {
    if (
      this.activatedRoute.snapshot.data &&
      this.activatedRoute.snapshot.data.inTibetan
    ) {
      this.inTibetan = this.activatedRoute.snapshot.data.inTibetan === 'true';
    }

    this.subscriptions.push(
      this.store.select('isSmallScreen').subscribe((isSmallScreen: boolean) => {
        this.isSmallScreen = isSmallScreen;
      })
    );

    this.subscriptions.push(
      this.store.select('searchFilters').subscribe((context) => {
        if (
          this.startDate !== context.startDate ||
          this.endDate !== context.endDate ||
          this.searchValue !== context.searchValue ||
          JSON.stringify(this.sourceFilters) !== JSON.stringify(context.sources)
        ) {
          this.offset = 0;
          this.startDate = context.startDate;
          this.endDate = context.endDate;
          this.searchValue = context.searchValue;
          this.sourceFilters = context.sources;
          this.loadArticles();
        }
      })
    );
  }

  public ngOnInit(): void {
    this.loadArticles();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public openLink(url: string): void {
    window.open(url, '_blank');
  }

  public onScroll(): void {
    this.loadArticles(true);
  }

  public getLabel(name: string): string {
    return Util.getLabel(name, this.isSmallScreen);
  }

  public toogleBookmark(article: Article): void {
    if (article.bookmarked) {
      article.bookmarked = false;
      this.storageService.removeArticle(article._id);
    } else {
      article.bookmarked = true;
      this.storageService.addArticle(article);
    }
  }

  private loadArticles(append?: boolean): void {
    this.isLoading = true;
    this.feedService
      .getArticles(
        this.offset,
        this.inTibetan,
        this.startDate,
        this.endDate,
        this.searchValue,
        this.sourceFilters
      )
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
    const bookmarks: Bookmark[] = this.storageService.getBookmarks();

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
