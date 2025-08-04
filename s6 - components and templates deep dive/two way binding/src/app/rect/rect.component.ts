import { Component, EventEmitter, Input, model, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rect',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './rect.component.html',
  styleUrl: './rect.component.css',
})
export class RectComponent {
  // Todo: Implement custom two-way binding

  // @Input({required: true}) size!: {width: number, height: number}
  // @Output() sizeChange = new EventEmitter<{width: number, height: number}>()

  size = model<{width: number, height: number}>({
    width: 100,
    height: 100,
  })

  onReset() {
    this.size.set({
      width: 100,
      height: 100,
    })
  }
}
