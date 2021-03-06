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
import { LocalStorageService } from './service/local-storage.service';
import { FeedService } from './service/feed.service';
import { InfiniteScrollComponent } from './shared/infinite-scroll/infinite-scroll.component';
import { VideoFeedComponent } from './feed/video-feed/video-feed.component';
import { TrimDateStringPipe } from './pipes/trim-date-string.pipe';
import { BookmarkComponent } from './feed/bookmark/bookmark.component';
import { DatePipe } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { searchFiltersReducer, smallScreenReducer } from '../app/reducers';
import { SearchFiltersComponent } from './shared/search-filters/search-filters.component';

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
    BookmarkComponent,
    SearchFiltersComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
    StoreModule.forRoot({
      isSmallScreen: smallScreenReducer,
      searchFilters: searchFiltersReducer,
    }),
  ],
  providers: [LocalStorageService, FeedService, DatePipe, TrimDateStringPipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
