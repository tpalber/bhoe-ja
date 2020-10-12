import {
  ADD_SEARCH_FILTERS,
  REMOVE_SEARCH_FILTERS,
  SearchFiltersActions,
} from '../actions';
import { SearchFilters } from '../models';

const initialState: SearchFilters = {};

export function searchFiltersReducer(
  state: SearchFilters = initialState,
  action: SearchFiltersActions
): SearchFilters | undefined {
  switch (action.type) {
    case ADD_SEARCH_FILTERS:
      return action.payload;
    case REMOVE_SEARCH_FILTERS:
      return initialState;
    default:
      return state;
  }
}
