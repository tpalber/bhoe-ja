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

  private windowSubscription$?: Subscription;
  private startDateSubscription$: Subscription | undefined;
  private endDateSubscription$: Subscription | undefined;
  private searchSubscription$: Subscription | undefined;
  private startDate: Date | undefined;
  private endDate: Date | undefined;
  private searchValue: string | undefined;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private contextService: ContextService,
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet
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
      this.startDateSubscription$ = startFormControl.valueChanges.subscribe(
        (val: Date) => {
          this.startDate = val;
          this.contextService.setContext(
            this.startDate,
            this.endDate,
            this.searchValue
          );
        }
      );
    }

    const endFormControl: any = this.filterForm.get('end');
    if (endFormControl) {
      this.endDateSubscription$ = endFormControl.valueChanges.subscribe(
        (val: Date) => {
          this.endDate = val;
          this.contextService.setContext(
            this.startDate,
            this.endDate,
            this.searchValue
          );
        }
      );
    }

    this.searchSubscription$ = this.searchForm.valueChanges.subscribe(
      (val: string) => {
        this.searchValue = val;
        this.contextService.setContext(
          this.startDate,
          this.endDate,
          this.searchValue
        );
      }
    );

    // TODO: Move this to ContextService
    this.windowSubscription$ = this.breakpointObserver
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
      });
  }

  public ngOnDestroy(): void {
    if (this.startDateSubscription$) {
      this.startDateSubscription$.unsubscribe();
    }
    if (this.endDateSubscription$) {
      this.endDateSubscription$.unsubscribe();
    }
    if (this.searchSubscription$) {
      this.searchSubscription$.unsubscribe();
    }
    if (this.windowSubscription$) {
      this.windowSubscription$.unsubscribe();
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

  public feedTypeSelected(index: number): void {
    this.contextService.setFeedType(index);
  }
}
