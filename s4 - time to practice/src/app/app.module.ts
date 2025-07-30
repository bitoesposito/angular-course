import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { InvestmentResultComponent } from './investment-result/investment-result.component';
import { HeaderComponent } from './header/header.component';
import { UserInputModule } from './user-input/user-input.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    InvestmentResultComponent
  ],
  imports: [BrowserModule, UserInputModule],
  bootstrap: [AppComponent]
})
export class AppModule {}