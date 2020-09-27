import { Component } from '@angular/core';
import { Video } from '../../models/video';
import { Util } from '../../util';
import { Subscription } from 'rxjs';
import { ContextService } from 'src/app/service/context.service';
import { FeedService } from 'src/app/service/feed.service';
import { debounceTime } from 'rxjs/operators';
import { StorageService } from 'src/app/service/storage.service';
import { Bookmark } from 'src/app/models/bookmark';

@Component({
  selector: 'app-video-feed',
  templateUrl: './video-feed.component.html',
  styleUrls: ['./video-feed.component.scss'],
})
export class VideoFeedComponent {
  public isLoading: boolean = true;
  public videos: Video[] = [];
  public isSmallScreen: boolean = true;

  private startDate?: Date;
  private endDate?: Date;
  private searchValue?: string;
  private offset: number = 0;
  private contextSubscription$?: Subscription;
  private isSmallScreenContextSubscription$?: Subscription;

  constructor(
    private storageService: StorageService,
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
          this.loadVideos(
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
    this.loadVideos(this.offset);
  }

  public ngOnDestroy(): void {
    if (this.contextSubscription$) {
      this.contextSubscription$.unsubscribe();
    }
    if (this.isSmallScreenContextSubscription$) {
      this.isSmallScreenContextSubscription$.unsubscribe();
    }
  }

  public openLink(id: string): void {
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
  }

  public getLabel(name: string): string {
    return Util.getLabel(name, true);
  }

  public onScroll(): void {
    this.loadVideos(
      this.offset,
      true,
      this.startDate,
      this.endDate,
      this.searchValue
    );
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

  private loadVideos(
    offset: number,
    append?: boolean,
    startDate?: Date,
    endDate?: Date,
    searchValue?: string
  ): void {
    this.isLoading = true;
    this.feedService
      .getVideos(offset, startDate, endDate, searchValue)
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
