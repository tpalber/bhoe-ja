import { SmallScreenActions, UPDATE_SMALL_SCREEN } from '../actions';

const initialState: boolean = true;

export function smallScreenReducer(
  state: boolean = initialState,
  action: SmallScreenActions
): boolean | undefined {
  switch (action.type) {
    case UPDATE_SMALL_SCREEN:
      return action.payload;
    default:
      return state;
  }
}
