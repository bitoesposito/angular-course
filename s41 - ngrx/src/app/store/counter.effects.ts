import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { decrement, increment, init, set } from "./counter.actions";
import { of, switchMap, tap, withLatestFrom } from "rxjs";
import { Store } from "@ngrx/store";
import { selectCount } from "./counter.selectors";

@Injectable()
export class CounterEffects {
  saveCount = createEffect(() => this.actions$.pipe(
    ofType(increment, decrement),
    withLatestFrom(this.store.select(selectCount)),
    tap(([action, counter]) => {
      console.log(action, counter);
      localStorage.setItem('count', counter.toString());
    })
  ), { dispatch: false });

  loadCount = createEffect(() => 
    this.actions$.pipe(
    ofType(init),
    switchMap(() => {
      const storedCounter = localStorage.getItem('count');
      if (storedCounter) {
        return of(set({value: +storedCounter}))
      }
      return of(set({value: 0}))
      })
    )
  )
    
  constructor(
    private actions$: Actions,
    private store: Store<{ counter: number }>
  ) {}
}