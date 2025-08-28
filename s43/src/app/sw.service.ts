import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servizio per gestire il Service Worker
 * Gestisce aggiornamenti, installazione e stato del SW
 */
@Injectable({
  providedIn: 'root'
})
export class SwService {
  // Subject per lo stato del service worker
  private readonly _swStatus = new BehaviorSubject<'enabled' | 'disabled' | 'error'>('disabled');
  
  // Observable pubblico per lo stato del SW
  public readonly swStatus$ = this._swStatus.asObservable();

  constructor(private readonly swUpdate: SwUpdate) {
    this.initializeServiceWorker();
  }

  /**
   * Inizializza il service worker e configura i listener
   */
  private initializeServiceWorker(): void {
    if (this.swUpdate.isEnabled) {
      this._swStatus.next('enabled');
      this.setupUpdateListeners();
    } else {
      this._swStatus.next('disabled');
    }
  }

  /**
   * Configura i listener per gli aggiornamenti del service worker
   */
  private setupUpdateListeners(): void {
    // Listener per quando è disponibile un aggiornamento
    this.swUpdate.versionUpdates.subscribe(event => {
      switch (event.type) {
        case 'VERSION_READY':
          console.log('Nuova versione disponibile:', event.latestVersion);
          this.promptUserForUpdate();
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.error('Installazione aggiornamento fallita:', event.error);
          this._swStatus.next('error');
          break;
      }
    });

    // Listener per errori del service worker
    this.swUpdate.unrecoverable.subscribe(event => {
      console.error('Errore irreversibile del service worker:', event.reason);
      this._swStatus.next('error');
    });
  }

  /**
   * Richiede all'utente di aggiornare l'app
   */
  private async promptUserForUpdate(): Promise<void> {
    if (confirm('È disponibile una nuova versione dell\'app. Vuoi aggiornare ora?')) {
      try {
        await this.swUpdate.activateUpdate();
        window.location.reload();
      } catch (error) {
        console.error('Errore durante l\'aggiornamento:', error);
      }
    }
  }

  /**
   * Controlla manualmente se ci sono aggiornamenti disponibili
   */
  public async checkForUpdate(): Promise<boolean> {
    try {
      const updateAvailable = await this.swUpdate.checkForUpdate();
      if (updateAvailable) {
        console.log('Aggiornamento disponibile');
        return true;
      } else {
        console.log('Nessun aggiornamento disponibile');
        return false;
      }
    } catch (error) {
      console.error('Errore durante il controllo aggiornamenti:', error);
      return false;
    }
  }

  /**
   * Attiva un aggiornamento disponibile
   */
  public async activateUpdate(): Promise<void> {
    try {
      await this.swUpdate.activateUpdate();
      console.log('Aggiornamento attivato con successo');
      window.location.reload();
    } catch (error) {
      console.error('Errore durante l\'attivazione dell\'aggiornamento:', error);
      throw error;
    }
  }

  /**
   * Verifica se il service worker è abilitato
   */
  public isEnabled(): boolean {
    return this.swUpdate.isEnabled;
  }

  /**
   * Ottiene lo stato corrente del service worker
   */
  public getStatus(): 'enabled' | 'disabled' | 'error' {
    return this._swStatus.value;
  }

  /**
   * Registra un service worker personalizzato
   */
  public async registerCustomSW(swUrl: string): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(swUrl);
        console.log('Service Worker registrato con successo:', registration);
        this._swStatus.next('enabled');
        return registration;
      } catch (error) {
        console.error('Errore durante la registrazione del Service Worker:', error);
        this._swStatus.next('error');
        return null;
      }
    }
    return null;
  }

  /**
   * Ottiene informazioni sulla registrazione del service worker
   */
  public async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration || null;
      } catch (error) {
        console.error('Errore nel recupero della registrazione SW:', error);
        return null;
      }
    }
    return null;
  }
}

