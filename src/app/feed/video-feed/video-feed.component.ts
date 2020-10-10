import { Component, OnDestroy, OnInit } from '@angular/core';
import { Util } from '../../util';
import { Subscription } from 'rxjs';
import { FeedService } from 'src/app/service/feed.service';
import { LocalStorageService } from 'src/app/service/local-storage.service';
import { Bookmark, Video } from '../../models';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-video-feed',
  templateUrl: './video-feed.component.html',
  styleUrls: ['./video-feed.component.scss'],
})
export class VideoFeedComponent implements OnInit, OnDestroy {
  public isLoading: boolean = true;
  public isSmallScreen: boolean = true;
  public videos: Video[] = [];

  private startDate?: Date;
  private endDate?: Date;
  private searchValue?: string;
  private sourceFilters?: string[];
  private offset: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private storageService: LocalStorageService,
    private feedService: FeedService,
    private store: Store<AppState>
  ) {
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
          this.searchValue !== context.search ||
          JSON.stringify(this.sourceFilters) !== JSON.stringify(context.sources)
        ) {
          this.offset = 0;
          this.startDate = context.startDate;
          this.endDate = context.endDate;
          this.searchValue = context.search;
          this.sourceFilters = context.sources;
          this.loadVideos();
        }
      })
    );
  }

  public ngOnInit(): void {
    this.loadVideos();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public openLink(id: string): void {
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
  }

  public getLabel(name: string): string {
    return Util.getLabel(name, true);
  }

  public onScroll(): void {
    this.loadVideos(true);
  }

  public toogleBookmark(video: Video): void {
    if (video.bookmarked) {
      video.bookmarked = false;
      this.storageService.removeVideo(video._id);
    } else {
      video.bookmarked = true;
      this.storageService.addVideo(video);
    }
  }

  private loadVideos(append?: boolean): void {
    this.isLoading = true;
    this.feedService
      .getVideos(
        this.offset,
        this.startDate,
        this.endDate,
        this.searchValue,
        this.sourceFilters
      )
      .toPromise()
      .then((videos) => {
        this.setBookmarks(videos);

        if (append) {
          this.videos = this.videos.concat(videos);
        } else {
          this.videos = videos;
        }
        this.offset = this.videos.length;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => (this.isLoading = false));
  }

  private setBookmarks(vidoes: Video[]): void {
    const bookmarks: Bookmark[] = this.storageService.getBookmarks();

    vidoes.forEach((vidoe) => {
      const index: number = bookmarks.findIndex(
        (i) => i._id === vidoe._id && i.isVideo
      );
      if (index >= 0) {
        vidoe.bookmarked = true;
      }
    });
  }
}
