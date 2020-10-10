import {
  SearchFiltersActions,
  UPDATE_START_DATE_SEARCH_FILTERS,
  UPDATE_END_DATE_SEARCH_FILTERS,
  UPDATE_SEARCH_VALUE_FILTERS,
  UPDATE_SEARCH_SOURCE_FILTERS,
} from '../actions';
import { SearchFilters } from '../models';

const initialState: SearchFilters = {};

function updateStartDate(
  state: SearchFilters,
  startDate: any
): SearchFilters | undefined {
  return { ...state, ...{ startDate: startDate } };
}

function updateEndDate(
  state: SearchFilters,
  endDate: any
): SearchFilters | undefined {
  return { ...state, ...{ endDate: endDate } };
}

function updateSearchValue(
  state: SearchFilters,
  searchValue: any
): SearchFilters | undefined {
  return { ...state, ...{ search: searchValue } };
}

function updateSearchSources(
  state: SearchFilters,
  sources: any
): SearchFilters | undefined {
  return { ...state, ...{ sources: sources } };
}

export function searchFiltersReducer(
  state: SearchFilters = initialState,
  action: SearchFiltersActions
): SearchFilters | undefined {
  switch (action.type) {
    case UPDATE_START_DATE_SEARCH_FILTERS:
      return updateStartDate(state, action.payload);
    case UPDATE_END_DATE_SEARCH_FILTERS:
      return updateEndDate(state, action.payload);
    case UPDATE_SEARCH_VALUE_FILTERS:
      return updateSearchValue(state, action.payload);
    case UPDATE_SEARCH_SOURCE_FILTERS:
      return updateSearchSources(state, action.payload);
    default:
      return state;
  }
}
