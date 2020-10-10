import { Injectable } from '@angular/core';
import { Article, Bookmark, Video } from '../models';
import { Subject } from 'rxjs';
import { TrimDateStringPipe } from '../pipes/trim-date-string.pipe';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private readonly bookmarkStorageKey: string = 'BhoejaBookmarks';
  private readonly darkModeStorageKey: string = 'BhoejaDarkMode';
  private storage: Storage = window.localStorage;
  private bookmarks: Bookmark[] = [];
  private darkMode: boolean = false;

  public onBookmarksChange: Subject<Bookmark[]> = new Subject<Bookmark[]>();
  public onDarkModeChange: Subject<boolean> = new Subject<boolean>();

  constructor(
    private trimDatePipe: TrimDateStringPipe,
    private datePipe: DatePipe
  ) {
    this.restoreBookmarks();
    this.restoreDarkMode();
  }

  public addArticle(article: Article): void {
    const dateTrimString: string = this.trimDatePipe.transform(article.date);
    const bookmark: Bookmark = {
      _id: article._id,
      title: article.title,
      source: article.source,
      link: article.link,
      date: dateTrimString,
      description: article.description,
      isVideo: false,
    };

    this.bookmarks.push(bookmark);
    this.onBookmarksChange.next(this.bookmarks);
    this.saveBookmark();
  }

  public removeArticle(id: string): void {
    const index: number = this.bookmarks.findIndex(
      (i) => i._id === id && !i.isVideo
    );
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      this.onBookmarksChange.next(this.bookmarks);
      this.saveBookmark();
    }
  }

  public addVideo(video: Video): void {
    const dateString: string =
      this.datePipe.transform(video.date, 'yyyy-MM-dd') || '';
    const bookmark: Bookmark = {
      _id: video._id,
      title: video.title,
      source: video.source,
      link: `https://www.youtube.com/watch?v=${video.videoID}`,
      date: dateString,
      isVideo: true,
      description: video.description,
      thumbnailBig: video.thumbnailBig,
    };

    this.bookmarks.push(bookmark);
    this.onBookmarksChange.next(this.bookmarks);
    this.saveBookmark();
  }

  public removeVideo(id: string): void {
    const index: number = this.bookmarks.findIndex(
      (i) => i._id === id && i.isVideo
    );
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      this.onBookmarksChange.next(this.bookmarks);
      this.saveBookmark();
    }
  }

  public getBookmarks(): Bookmark[] {
    return this.bookmarks.sort((b1, b2) => (b1.date > b2.date ? -1 : 1));
  }

  public getBookmarkCount(): number {
    return this.bookmarks.length;
  }

  public toggleDarkMode(enabled: boolean): void {
    this.darkMode = enabled;
    this.onDarkModeChange.next(this.darkMode);
    this.saveDarkMode();
  }

  public getDarkMode(): boolean {
    return this.darkMode;
  }

  private clearBookmarks(): void {
    this.bookmarks = [];
    this.onBookmarksChange.next(this.bookmarks);
    this.saveBookmark();
  }

  private saveBookmark(): void {
    this.storage.setItem(
      this.bookmarkStorageKey,
      JSON.stringify({ bookmarks: this.getBookmarks() })
    );
  }

  private restoreBookmarks(): void {
    try {
      if (!this.storage.getItem(this.bookmarkStorageKey)) {
        this.clearBookmarks();
      }

      const _bookmarks = JSON.parse(
        this.storage.getItem(this.bookmarkStorageKey) || ''
      );
      if (
        !(
          _bookmarks.hasOwnProperty('bookmarks') &&
          Array.isArray(_bookmarks.bookmarks)
        )
      ) {
        this.clearBookmarks();
      }
      this.bookmarks = _bookmarks.bookmarks;
      this.onBookmarksChange.next(this.bookmarks);
    } catch (e) {
      console.error(`Error restoring bhoe ja bookmarks: ${e}`);
      this.clearBookmarks();
    }
  }

  private clearDarkMode(): void {
    this.darkMode = false;
    this.onDarkModeChange.next(this.darkMode);
    this.saveDarkMode();
  }

  private saveDarkMode(): void {
    this.storage.setItem(
      this.darkModeStorageKey,
      JSON.stringify({ darkMode: this.darkMode })
    );
  }

  private restoreDarkMode(): void {
    try {
      if (!this.storage.getItem(this.darkModeStorageKey)) {
        this.clearDarkMode();
      }

      const _darkMode = JSON.parse(
        this.storage.getItem(this.darkModeStorageKey) || ''
      );
      if (
        !(
          _darkMode.hasOwnProperty('darkMode') &&
          typeof _darkMode.darkMode === 'boolean'
        )
      ) {
        this.clearDarkMode();
      }
      this.darkMode = _darkMode.darkMode;
      this.onDarkModeChange.next(this.darkMode);
    } catch (e) {
      console.error(`Error restoring bhoe ja dark mode: ${e}`);
      this.clearDarkMode();
    }
  }
}
