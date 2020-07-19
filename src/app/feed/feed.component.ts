import { Component, OnInit } from '@angular/core';
import { FeedService } from '../service/feed.service';
import { Article } from '../models/article';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
})
export class FeedComponent implements OnInit {
  public isLoading: boolean = true;
  public articles: Article[] = [];

  constructor(private feedService: FeedService) {}

  ngOnInit(): void {
    this.feedService
      .getMockArticles()
      .toPromise()
      .then((articles) => (this.articles = articles))
      .finally(() => (this.isLoading = false));
  }

  public openLink(url: string) {
    window.open(url, '_blank');
  }
}
