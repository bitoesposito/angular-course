import { createAction, props } from '@ngrx/store';

export const increment = createAction(
  '[Counter] Increment',
  props<{value: number}>()
);

export const decrement = createAction(
  '[Counter] Decrement',
  props<{value: number}>()
)

export const init = createAction(
  '[Counter] Initialize',
  props<{value: number}>()
)

export const set = createAction(
  '[Counter] Set',
  props<{value: number}>()
)