import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appLog]',
  standalone: true,
  host: {
    '(click)': 'log()'
  }
})
export class LogDirective {

  constructor(
    private elementRef: ElementRef
  ) { }

  log() {
    console.log(this.elementRef.nativeElement);
  }

}
