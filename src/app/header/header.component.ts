import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { AboutComponent } from '../shared/about/about.component';
import { SearchFiltersComponent } from '../shared/search-filters/search-filters.component';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { LocalStorageService } from '../service/local-storage.service';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public readonly title: string = 'BHOE JA';

  public isSmallScreen: boolean = true;
  public tabIndex: number = 0;
  public tabEnabled: boolean = true;
  public bookmarkCount: number = 0;
  public isDarkMode: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {}

  public ngOnInit(): void {
    this.subscriptions.push(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.tabEnabled = event?.url === '/bookmark' ? false : true;

          if (event?.url === '/' || event?.url === '/articles') {
            this.tabIndex = 1;
          } else if (event?.url === '/tibetan-articles') {
            this.tabIndex = 0;
          } else if (event?.url === '/videos') {
            this.tabIndex = 2;
          } else {
            this.tabIndex = 1;
          }
        })
    );

    this.subscriptions.push(
      this.store.select('isSmallScreen').subscribe((isSmallScreen: boolean) => {
        this.isSmallScreen = isSmallScreen;
      })
    );

    this.isDarkMode = this.localStorageService.getDarkMode();
    this.subscriptions.push(
      this.localStorageService.onDarkModeChange.subscribe(() => {
        this.isDarkMode = this.localStorageService.getDarkMode();
      })
    );

    this.bookmarkCount = this.localStorageService.getBookmarkCount();
    this.subscriptions.push(
      this.localStorageService.onBookmarksChange.subscribe(() => {
        this.bookmarkCount = this.localStorageService.getBookmarkCount();
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public openAboutSheet(): void {
    const config: MatBottomSheetConfig = {
      panelClass: 'bottom-sheet',
    };
    this.bottomSheet.open(AboutComponent, config);
  }

  public openFilterDialog(): void {
    this.dialog.open(SearchFiltersComponent);
  }

  public navigateToBookmark(): void {
    this.router.navigate(['bookmark'], { relativeTo: this.route });
  }

  public navigateToHome(): void {
    this.router.navigate([''], { relativeTo: this.route });
  }

  public feedTypeSelected(index: number): void {
    if (index === 0) {
      this.router.navigate(['tibetan-articles'], { relativeTo: this.route });
    } else if (index === 1) {
      this.router.navigate(['articles'], { relativeTo: this.route });
    } else {
      this.router.navigate(['videos'], { relativeTo: this.route });
    }
  }
}
