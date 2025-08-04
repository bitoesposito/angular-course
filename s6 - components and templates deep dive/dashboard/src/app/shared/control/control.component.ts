import { afterNextRender, afterRender, Component, contentChild, ContentChild, ElementRef, HostBinding, HostListener, inject, Input, ViewEncapsulation } from '@angular/core';

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
  // @ContentChild('input') private control?: ElementRef<HTMLInputElement | HTMLTextAreaElement>;
  private control = contentChild<ElementRef<HTMLInputElement | HTMLTextAreaElement>>('input')

  constructor() {
    afterRender(() => {
      console.log('AFTER RENDER')
    })

    afterNextRender(() => {
      console.log('AFTER NEXT RENDER')
    })
  }
  
  onControlClick() {
    console.log(this.el);
    // console.log(this.control)
    console.log(this.control())
  }
}
