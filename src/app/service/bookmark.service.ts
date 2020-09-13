import { Injectable } from '@angular/core';
import { Article } from '../models/article';
import { Bookmark } from '../models/bookmark';
import { Video } from '../models/video';
import { Subject } from 'rxjs';
import { TrimDateStringPipe } from '../pipes/trim-date-string.pipe';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class BookmarkService {
  private readonly storageKey: string = 'BhoejaBookmarks';
  private storage: Storage = window.localStorage;
  private bookmarks: Bookmark[] = [];

  public onBookmarksChange: Subject<Bookmark[]> = new Subject<Bookmark[]>();

  constructor(
    private trimDatePipe: TrimDateStringPipe,
    private datePipe: DatePipe
  ) {
    this.restore();
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
    this.save();
  }

  public removeArticle(id: string): void {
    const index: number = this.bookmarks.findIndex(
      (i) => i._id === id && !i.isVideo
    );
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      this.onBookmarksChange.next(this.bookmarks);
      this.save();
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
    this.save();
  }

  public removeVideo(id: string): void {
    const index: number = this.bookmarks.findIndex(
      (i) => i._id === id && i.isVideo
    );
    if (index !== -1) {
      this.bookmarks.splice(index, 1);
      this.onBookmarksChange.next(this.bookmarks);
      this.save();
    }
  }

  public getBookmarks(): Bookmark[] {
    return this.bookmarks.sort((b1, b2) => (b1.date > b2.date ? -1 : 1));
  }

  public getBookmarkCount(): number {
    return this.bookmarks.length;
  }

  private clear(): void {
    this.bookmarks = [];
    this.onBookmarksChange.next(this.bookmarks);
    this.save();
  }

  private save(): void {
    this.storage.setItem(
      this.storageKey,
      JSON.stringify({ bookmarks: this.getBookmarks() })
    );
  }

  private restore(): void {
    try {
      if (!this.storage.getItem(this.storageKey)) {
        this.clear();
      }
      const sc = JSON.parse(this.storage.getItem(this.storageKey) || '');
      if (!(sc.hasOwnProperty('bookmarks') && Array.isArray(sc.bookmarks))) {
        this.clear();
      }
      this.bookmarks = sc.bookmarks;
      this.onBookmarksChange.next(this.bookmarks);
    } catch (e) {
      console.error(`Error restoring bhoe ja bookmarks: ${e}`);
      this.clear();
    }
  }
}
