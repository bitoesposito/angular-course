import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { COMPOSITION_BUFFER_MODE } from '@angular/forms';
import { interval, map, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  clickCount = signal(0)
  clickCount$ = toObservable(this.clickCount)
  interval$ = interval(1000)
  intervalSignal = toSignal(this.interval$, { initialValue: 0 })
  // interval = signal(0)
  // doubleInterval = computed(() => this.interval() * 2)
  customInterval$ = new Observable((subscriber) => {
    let timesExecuted = 0
    setInterval(() => {
      // subscriber.error(new Error('Error'))
      if (timesExecuted < 5) {
        console.log('Emitting new value...');
        subscriber.next({message: `New value ${timesExecuted++}`})
      } else {
        subscriber.complete()
      }
    }, 100)
  })
  customIntervalSignal = toSignal(this.customInterval$, { initialValue: 0 })
  private destroyRef = inject(DestroyRef)

  constructor() {
    // effect(() => {
    //   console.log(`clicked button ${this.clickCount()} times`)
    // })
  }

  ngOnInit(): void {

    // setInterval(() => {
    //   this.interval.update(prevIntervalNumber => prevIntervalNumber + 1)
    // }, 1000)

    // const subscription = interval(1000).pipe(
    //   map((val) => val * 2 )
    // ).subscribe({
    //   next: (val) => console.log(val)
    // })

    this.customInterval$.subscribe({
      next: (val) => console.log(val),
      complete: () => console.log('COMPLETED!'),
      error: (err) => console.log(err)
    })
    
    const subscription = this.clickCount$.subscribe({
      next: (val) => console.log(`Clicked button ${this.clickCount()} times`)
    })

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }

  onClick() {
    this.clickCount.update(prevCount => prevCount + 1)
  }
}
