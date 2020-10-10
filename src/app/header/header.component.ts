import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { AboutComponent } from '../shared/about/about.component';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { debounceTime, filter } from 'rxjs/operators';
import { LocalStorageService } from '../service/local-storage.service';
import { sourceListing, SourceType } from '../models';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import {
  UpdateEndDateSearchFilters,
  UpdateSearchSourceFilters,
  UpdateSearchValueFilters,
  UpdateStartDateSearchFilters,
} from '../actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public readonly title: string = 'BHOE JA';
  public readonly currentDate: Date = new Date();
  public readonly articleSourceList: string[] = sourceListing
    .filter((source) => source.type === SourceType.article)
    .map((source) => source.name);
  public readonly videoSourceList: string[] = sourceListing
    .filter((source) => source.type === SourceType.video)
    .map((source) => source.name);

  public filterPanel: boolean = false;
  public isSmallScreen: boolean = true;
  public tabIndex: number = 0;
  public tabEnabled: boolean = true;
  public bookmarkCount: number = 0;
  public isDarkMode: boolean = false;
  public filterForm: FormGroup;
  public searchForm: FormControl;
  public sourcesForm: FormControl;

  private subscriptions: Subscription[] = [];

  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>
  ) {
    this.filterForm = this.formBuilder.group({
      start: new FormControl({ value: null, disabled: true }),
      end: new FormControl({ value: null, disabled: true }),
    });
    this.searchForm = new FormControl();
    this.sourcesForm = new FormControl();
  }

  public ngOnInit(): void {
    const startFormControl: any = this.filterForm.get('start');
    if (startFormControl) {
      this.subscriptions.push(
        startFormControl.valueChanges
          .pipe(debounceTime(500))
          .subscribe((val: Date) => {
            this.store.dispatch(new UpdateStartDateSearchFilters(val));
          })
      );
    }

    const endFormControl: any = this.filterForm.get('end');
    if (endFormControl) {
      this.subscriptions.push(
        endFormControl.valueChanges
          .pipe(debounceTime(500))
          .subscribe((val: Date) => {
            this.store.dispatch(new UpdateEndDateSearchFilters(val));
          })
      );
    }

    this.subscriptions.push(
      this.searchForm.valueChanges
        .pipe(debounceTime(500))
        .subscribe((val: string) => {
          this.store.dispatch(new UpdateSearchValueFilters(val));
        })
    );

    this.subscriptions.push(
      this.sourcesForm.valueChanges
        .pipe(debounceTime(500))
        .subscribe((val: string[]) => {
          this.store.dispatch(new UpdateSearchSourceFilters(val));
        })
    );

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

  public openFilterPanel(): void {
    this.filterPanel = !this.filterPanel;
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
