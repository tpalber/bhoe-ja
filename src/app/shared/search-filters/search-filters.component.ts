import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { RemoveSearchFilters, AddSearchFilters } from 'src/app/actions';
import { AppState } from 'src/app/app.state';
import { sourceListing, SourceType } from 'src/app/models';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
})
export class SearchFiltersComponent implements OnDestroy {
  public readonly currentDate: Date = new Date();
  public readonly articleSourceList: string[] = sourceListing
    .filter((source) => source.type === SourceType.article)
    .map((source) => source.name);
  public readonly videoSourceList: string[] = sourceListing
    .filter((source) => source.type === SourceType.video)
    .map((source) => source.name);

  public filterForm: FormGroup;

  private subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<SearchFiltersComponent>,
    private formBuilder: FormBuilder,
    private store: Store<AppState>
  ) {
    this.filterForm = this.formBuilder.group({
      startDate: new FormControl({ disabled: true }),
      endDate: new FormControl({ disabled: true }),
      searchValue: new FormControl(),
      sources: new FormControl(),
    });
    this.subscriptions.push(
      this.store.select('searchFilters').subscribe((context) => {
        this.filterForm.get('startDate')?.setValue(context.startDate);
        this.filterForm.get('endDate')?.setValue(context.endDate);
        this.filterForm.get('searchValue')?.setValue(context.searchValue);
        this.filterForm.get('sources')?.setValue(context.sources);
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  public onClear(): void {
    this.store.dispatch(new RemoveSearchFilters());
    this.dialogRef.close();
  }

  public onDone(): void {
    this.store.dispatch(new AddSearchFilters(this.filterForm.value));
    this.dialogRef.close();
  }
}
