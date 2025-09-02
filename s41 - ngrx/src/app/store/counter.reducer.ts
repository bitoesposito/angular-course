import { createReducer, on } from '@ngrx/store';

import { increment, decrement, set } from './counter.actions';

const initialState = 0;

export const counterReducer = createReducer(
  initialState,
  on(increment, (state, action) => state + action.value),
  on(decrement, (state, action) => state - action.value),
  on(set, (state, action) => action.value)
);

// export function counterReducer(state = initialState) {
//   return state;
// }

