import { SearchFilters } from './models';

export interface AppState {
  readonly isSmallScreen: boolean;
  readonly searchFilters: SearchFilters;
}
