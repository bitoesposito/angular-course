import { Component, computed } from '@angular/core';
import { InvestmentService } from '../investment.service';

@Component({
  selector: 'app-investment-result',
  templateUrl: './investment-result.component.html',
  styleUrl: './investment-result.component.css'
})
export class InvestmentResultComponent {

  constructor(private investmentService: InvestmentService) {}

  results = computed(() => this.investmentService.resultData());
}
