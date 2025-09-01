import { Component, signal, inject } from '@angular/core';
import { ConnectivityService } from './connectivity.service';
import { CommonModule } from '@angular/common';

/**
 * Componente principale dell'applicazione
 * Include il sistema di monitoraggio della connettività
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // Inietta il servizio di connettività
  private readonly connectivityService = inject(ConnectivityService);
  
  // Espone i signal per il template
  protected readonly title = signal('s43');
  protected readonly isOnline = this.connectivityService.isOnline;
  protected readonly connectionInfo = this.connectivityService.getConnectionInfo();
}
