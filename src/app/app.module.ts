import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FeedComponent } from './feed/feed.component';
import { MaterialModule } from './material/material.module';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from './shared/loading/loading.component';
import { AboutComponent } from './shared/about/about.component';
import { LabelComponent } from './shared/label/label.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FeedService } from './service/feed.service';
import { ContextService } from './service/context.service';
import { InfiniteScrollComponent } from './shared/infinite-scroll/infinite-scroll.component';
import { VideoFeedComponent } from './feed/video-feed/video-feed.component';
import { TrimDateStringPipe } from './pipes/trim-date-string.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FeedComponent,
    HeaderComponent,
    LoadingComponent,
    AboutComponent,
    LabelComponent,
    InfiniteScrollComponent,
    VideoFeedComponent,
    TrimDateStringPipe,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  providers: [ContextService, FeedService],
  bootstrap: [AppComponent],
})
export class AppModule {}
