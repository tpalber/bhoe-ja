import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { UpdateSmallScreen } from './actions';
import { AppState } from './app.state';
import { LocalStorageService } from './service/local-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private isDarkMode: boolean;
  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private breakpointObserver: BreakpointObserver,
    private localStorageService: LocalStorageService,
    private renderer: Renderer2,
    private store: Store<AppState>
  ) {
    this.subscriptions.push(
      this.breakpointObserver
        .observe([Breakpoints.Web, Breakpoints.WebLandscape])
        .subscribe((state: BreakpointState) => {
          if (
            state.breakpoints[Breakpoints.Web] ||
            state.breakpoints[Breakpoints.WebLandscape]
          ) {
            this.store.dispatch(new UpdateSmallScreen(false));
          } else {
            this.store.dispatch(new UpdateSmallScreen(true));
          }
        })
    );

    this.isDarkMode = this.localStorageService.getDarkMode();
    this.renderer.setAttribute(
      this.document.body,
      'class',
      this.isDarkMode ? 'bhoeja-dark' : 'bhoeja-light'
    );

    this.subscriptions.push(
      this.localStorageService.onDarkModeChange.subscribe(() => {
        if (this.isDarkMode != this.localStorageService.getDarkMode()) {
          this.isDarkMode = this.localStorageService.getDarkMode();
          this.renderer.setAttribute(
            this.document.body,
            'class',
            this.isDarkMode ? 'bhoeja-dark' : 'bhoeja-light'
          );
        }
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
