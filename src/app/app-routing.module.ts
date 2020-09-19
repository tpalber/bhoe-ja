import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FeedComponent } from './feed/feed.component';
import { VideoFeedComponent } from './feed/video-feed/video-feed.component';
import { BookmarkComponent } from './feed/bookmark/bookmark.component';

const routes: Routes = [
  { path: '', redirectTo: '/articles', pathMatch: 'full' },
  { path: 'articles', component: FeedComponent },
  {
    path: 'tibetan-articles',
    component: FeedComponent,
    data: { inTibetan: 'true' },
  },
  { path: 'videos', component: VideoFeedComponent },
  { path: 'bookmark', component: BookmarkComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
