import { Action } from '@ngrx/store';

export const UPDATE_START_DATE_SEARCH_FILTERS: string =
  '[SEARCH FILTERS] Update Start Date';
export const UPDATE_END_DATE_SEARCH_FILTERS: string =
  '[SEARCH FILTERS] Update End Date';
export const UPDATE_SEARCH_VALUE_FILTERS: string =
  '[SEARCH FILTERS] Update Search Value';
export const UPDATE_SEARCH_SOURCE_FILTERS: string =
  '[SEARCH FILTERS] Update Serach Source';

export class UpdateStartDateSearchFilters implements Action {
  readonly type: string = UPDATE_START_DATE_SEARCH_FILTERS;

  constructor(public payload?: Date) {}
}

export class UpdateEndDateSearchFilters implements Action {
  readonly type: string = UPDATE_END_DATE_SEARCH_FILTERS;

  constructor(public payload?: Date) {}
}

export class UpdateSearchValueFilters implements Action {
  readonly type: string = UPDATE_SEARCH_VALUE_FILTERS;

  constructor(public payload?: string) {}
}

export class UpdateSearchSourceFilters implements Action {
  readonly type: string = UPDATE_SEARCH_SOURCE_FILTERS;

  constructor(public payload?: string[]) {}
}

export type SearchFiltersActions =
  | UpdateStartDateSearchFilters
  | UpdateEndDateSearchFilters
  | UpdateSearchValueFilters
  | UpdateSearchSourceFilters;
