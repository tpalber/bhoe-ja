import { Action } from '@ngrx/store';
import { SearchFilters } from '../models';

export const ADD_SEARCH_FILTERS: string = '[SEARCH FILTERS] Add';
export const REMOVE_SEARCH_FILTERS: string = '[SEARCH FILTERS] Remove';

export class AddSearchFilters implements Action {
  readonly type: string = ADD_SEARCH_FILTERS;

  constructor(public payload?: SearchFilters) {}
}

export class RemoveSearchFilters implements Action {
  readonly type: string = REMOVE_SEARCH_FILTERS;

  constructor(public payload?: SearchFilters) {}
}

export type SearchFiltersActions = AddSearchFilters | RemoveSearchFilters;
