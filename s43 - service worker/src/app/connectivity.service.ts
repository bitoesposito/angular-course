import { Injectable, signal } from '@angular/core';

/**
 * Servizio per gestire lo stato della connettività
 * Monitora i cambiamenti online/offline in tempo reale
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  // Signal per lo stato online/offline
  private readonly _isOnline = signal<boolean>(navigator.onLine);
  
  // Getter pubblico per lo stato online
  public readonly isOnline = this._isOnline.asReadonly();

  constructor() {
    this.initializeConnectivityMonitoring();
  }

  /**
   * Inizializza il monitoraggio della connettività
   * Ascolta gli eventi online/offline del browser
   */
  private initializeConnectivityMonitoring(): void {
    // Gestisce il cambio di stato online
    window.addEventListener('online', () => {
      console.log('🟢 Connessione ripristinata');
      this._isOnline.set(true);
    });

    // Gestisce il cambio di stato offline
    window.addEventListener('offline', () => {
      console.log('🔴 Connessione persa');
      this._isOnline.set(false);
    });
  }

  /**
   * Ottiene informazioni sulla connessione
   */
  public getConnectionInfo(): { effectiveType: string; downlink: number; rtt: number } | null {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0
      };
    }
    return null;
  }
}

