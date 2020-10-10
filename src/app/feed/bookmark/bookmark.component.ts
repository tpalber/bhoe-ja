import { Component, OnInit, OnDestroy } from '@angular/core';
import { Bookmark } from '../../models';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/service/local-storage.service';
import { Util } from 'src/app/util';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.state';

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

  private subscriptions: Subscription[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private store: Store<AppState>
  ) {
    this.subscriptions.push(
      this.store.select('isSmallScreen').subscribe((isSmallScreen: boolean) => {
        this.isSmallScreen = isSmallScreen;
      })
    );
  }

  public ngOnInit(): void {
    this.loadBookmarks();
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public openLink(url: string): void {
    window.open(url, '_blank');
  }

  public removeBookmark(bookmark: Bookmark): void {
    if (bookmark.isVideo) {
      this.localStorageService.removeVideo(bookmark._id);
    } else {
      this.localStorageService.removeArticle(bookmark._id);
    }
  }

  public getLabel(name: string): string {
    return Util.getLabel(name, true);
  }

  private loadBookmarks(): void {
    this.bookmarks = this.localStorageService.getBookmarks();
    this.isLoading = false;
  }
}
