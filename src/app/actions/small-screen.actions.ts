import { Action } from '@ngrx/store';

export const UPDATE_SMALL_SCREEN: string = '[SMALL SCREEN] Set';

export class UpdateSmallScreen implements Action {
  readonly type: string = UPDATE_SMALL_SCREEN;

  constructor(public payload?: boolean) {}
}

export type SmallScreenActions = UpdateSmallScreen;
