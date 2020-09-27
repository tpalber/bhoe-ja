import { Component, OnInit, OnDestroy } from '@angular/core';
import { Bookmark } from '../../models/bookmark';
import { Subscription } from 'rxjs';
import { ContextService } from 'src/app/service/context.service';
import { StorageService } from 'src/app/service/storage.service';
import { Util } from 'src/app/util';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('* => void', [
        animate(300, style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class BookmarkComponent implements OnInit, OnDestroy {
  public isLoading: boolean = true;
  public bookmarks: Bookmark[] = [];
  public isSmallScreen: boolean = true;

  private isSmallScreenContextSubscription$?: Subscription;

  constructor(
    private contextService: ContextService,
    private storageService: StorageService
  ) {
    this.isSmallScreenContextSubscription$ = this.contextService.isSmallScreenContext$.subscribe(
      (isSmallScreen) => {
        if (this.isSmallScreen !== isSmallScreen) {
          this.isSmallScreen = isSmallScreen;
        }
      }
    );
  }

  public ngOnInit(): void {
    this.loadBookmarks();
  }

  public ngOnDestroy(): void {
    if (this.isSmallScreenContextSubscription$) {
      this.isSmallScreenContextSubscription$.unsubscribe();
    }
  }

  public openLink(url: string): void {
    window.open(url, '_blank');
  }

  public removeBookmark(bookmark: Bookmark): void {
    if (bookmark.isVideo) {
      this.storageService.removeVideo(bookmark._id);
    } else {
      this.storageService.removeArticle(bookmark._id);
    }
  }

  public getLabel(name: string): string {
    return Util.getLabel(name, true);
  }

  private loadBookmarks(): void {
    this.bookmarks = this.storageService.getBookmarks();
    this.isLoading = false;
  }
}
