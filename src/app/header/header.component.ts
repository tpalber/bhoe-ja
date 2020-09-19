import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { AboutComponent } from '../shared/about/about.component';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContextService } from '../service/context.service';
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BookmarkService } from '../service/bookmark.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public readonly title: string = 'BHOE JA';
  public readonly currentDate: Date = new Date();
  public filterPanel: boolean = false;
  public filterForm: FormGroup;
  public searchForm: FormControl;
  public isSmallScreen: boolean = true;
  public tabIndex: number = 0;
  public tabEnabled: boolean = true;
  public bookmarkCount: number = 0;

  private windowSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private startDateSubscription?: Subscription;
  private endDateSubscription?: Subscription;
  private searchSubscription?: Subscription;
  private bookmarkCountSubscription?: Subscription;

  constructor(
    private bookmarkService: BookmarkService,
    private breakpointObserver: BreakpointObserver,
    private contextService: ContextService,
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.filterForm = this.formBuilder.group({
      start: new FormControl({ value: null, disabled: true }),
      end: new FormControl({ value: null, disabled: true }),
    });
    this.searchForm = new FormControl();
  }
  public ngOnInit(): void {
    const startFormControl: any = this.filterForm.get('start');
    if (startFormControl) {
      this.startDateSubscription = startFormControl.valueChanges.subscribe(
        (val: Date) => {
          this.contextService.setStartDateContext(val);
        }
      );
    }

    const endFormControl: any = this.filterForm.get('end');
    if (endFormControl) {
      this.endDateSubscription = endFormControl.valueChanges.subscribe(
        (val: Date) => {
          this.contextService.setEndDateContext(val);
        }
      );
    }

    this.searchSubscription = this.searchForm.valueChanges.subscribe(
      (val: string) => {
        this.contextService.setSearchValueContext(val);
      }
    );

    this.routeSubscription = this.router.events
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
      });

    this.windowSubscription = this.breakpointObserver
      .observe([Breakpoints.Web, Breakpoints.WebLandscape])
      .subscribe((state: BreakpointState) => {
        if (
          state.breakpoints[Breakpoints.Web] ||
          state.breakpoints[Breakpoints.WebLandscape]
        ) {
          this.isSmallScreen = false;
        } else {
          this.isSmallScreen = true;
        }
        this.contextService.setSmallScreenContext(this.isSmallScreen);
      });

    this.bookmarkCount = this.bookmarkService.getBookmarkCount();
    this.bookmarkCountSubscription = this.bookmarkService.onBookmarksChange.subscribe(
      () => {
        this.bookmarkCount = this.bookmarkService.getBookmarkCount();
      }
    );
  }

  public ngOnDestroy(): void {
    if (this.startDateSubscription) {
      this.startDateSubscription.unsubscribe();
    }
    if (this.endDateSubscription) {
      this.endDateSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.windowSubscription) {
      this.windowSubscription.unsubscribe();
    }
    if (this.bookmarkCountSubscription) {
      this.bookmarkCountSubscription.unsubscribe();
    }
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
