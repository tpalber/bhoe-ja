import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetConfig,
} from '@angular/material/bottom-sheet';
import { AboutComponent } from '../shared/about/about.component';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ContextService } from '../service/context.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  public readonly title: string = 'BHOE JA';
  public readonly currentDate: Date = new Date();
  public dateRangeSelector: boolean = false;
  public dateRangeForm: FormGroup;

  private startDateSubscription$: Subscription | undefined;
  private endDateSubscription$: Subscription | undefined;
  private startDate: Date | undefined;
  private endDate: Date | undefined;

  constructor(
    private contextService: ContextService,
    private formBuilder: FormBuilder,
    private bottomSheet: MatBottomSheet
  ) {
    this.dateRangeForm = this.formBuilder.group({
      start: new FormControl({ value: null, disabled: true }),
      end: new FormControl({ value: new Date(), disabled: true }),
    });
  }
  public ngOnInit(): void {
    const startFormControl: any = this.dateRangeForm.get('start');
    if (startFormControl) {
      this.startDateSubscription$ = startFormControl.valueChanges.subscribe(
        (val: Date) => {
          this.startDate = val;
          this.contextService.setDateRange(this.startDate, this.endDate);
        }
      );
    }

    const endFormControl: any = this.dateRangeForm.get('end');
    if (endFormControl) {
      this.endDateSubscription$ = endFormControl.valueChanges.subscribe(
        (val: Date) => {
          this.endDate = val;
          this.contextService.setDateRange(this.startDate, this.endDate);
        }
      );
    }
  }

  public ngOnDestroy(): void {
    if (this.startDateSubscription$) {
      this.startDateSubscription$.unsubscribe();
    }
    if (this.endDateSubscription$) {
      this.endDateSubscription$.unsubscribe();
    }
  }

  public openAboutSheet(): void {
    const config: MatBottomSheetConfig = {
      panelClass: 'bottom-sheet',
    };
    this.bottomSheet.open(AboutComponent, config);
  }

  public openDateRangeSelector(): void {
    this.dateRangeSelector = !this.dateRangeSelector;
  }
}
