import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentResult } from '../investment-input.model';

@Component({
  selector: 'app-investment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-result.component.html',
  styleUrl: './investment-result.component.css'
})
export class InvestmentResultComponent {
  @Input() results: InvestmentResult[] = [];
}
