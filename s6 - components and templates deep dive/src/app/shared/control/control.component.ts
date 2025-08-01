import { Component, ElementRef, HostBinding, HostListener, inject, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-control',
  standalone: true,
  imports: [],
  templateUrl: './control.component.html',
  styleUrl: './control.component.css',
  encapsulation: ViewEncapsulation.None ,
  host: {
    class: 'control',
    '(click)': 'onControlClick()'
  }
})
export class ControlComponent {
  @Input({required: true}) label: string = '';
  private el = inject(ElementRef);
  
  onControlClick() {
    console.log(this.el);
  }
}
