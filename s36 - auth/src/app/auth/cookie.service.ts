import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {

  /**
   * Imposta un cookie con opzioni di sicurezza
   * @param name - Nome del cookie
   * @param value - Valore del cookie
   * @param days - Giorni di validità (default: 7)
   */
  setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Opzioni di sicurezza per i cookie
    const cookieOptions = [
      `expires=${expires.toUTCString()}`,
      'path=/',
      'SameSite=Strict' // Protegge da attacchi CSRF
    ];
    
    // Aggiungi Secure solo in produzione (HTTPS)
    if (window.location.protocol === 'https:') {
      cookieOptions.push('Secure');
    }
    
    document.cookie = `${name}=${value}; ${cookieOptions.join('; ')}`;
  }

  /**
   * Ottiene il valore di un cookie
   * @param name - Nome del cookie
   * @returns Valore del cookie o null se non trovato
   */
  getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
  }

  /**
   * Elimina un cookie
   * @param name - Nome del cookie
   */
  deleteCookie(name: string): void {
    // Imposta la data di scadenza nel passato per eliminare il cookie
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  /**
   * Verifica se un cookie esiste
   * @param name - Nome del cookie
   * @returns true se il cookie esiste
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Elimina tutti i cookie di autenticazione
   */
  clearAuthCookies(): void {
    this.deleteCookie('authToken');
    this.deleteCookie('user');
  }
}
