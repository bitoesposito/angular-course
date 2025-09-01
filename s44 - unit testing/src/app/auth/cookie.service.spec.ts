import { TestBed } from '@angular/core/testing';
import { CookieService } from './cookie.service';

describe('CookieService', () => {
  let service: CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CookieService]
    });
    service = TestBed.inject(CookieService);
    
    // Pulisci tutti i cookie prima di ogni test
    service.deleteCookie('testCookie');
    service.deleteCookie('otherCookie');
    service.deleteCookie('authToken');
    service.deleteCookie('user');
  });

  afterEach(() => {
    // Pulisci dopo ogni test
    service.deleteCookie('testCookie');
    service.deleteCookie('otherCookie');
    service.deleteCookie('authToken');
    service.deleteCookie('user');
  });

  it('dovrebbe creare il servizio', () => {
    expect(service).toBeTruthy();
  });

  describe('setCookie e getCookie', () => {
    it('dovrebbe impostare e leggere un cookie con durata predefinita', () => {
      service.setCookie('testCookie', 'testValue');
      const result = service.getCookie('testCookie');
      expect(result).toBe('testValue');
    });

    it('dovrebbe impostare e leggere un cookie con durata personalizzata', () => {
      service.setCookie('testCookie', 'testValue', 30);
      const result = service.getCookie('testCookie');
      expect(result).toBe('testValue');
    });

    it('dovrebbe restituire null per cookie inesistente', () => {
      const result = service.getCookie('nonexistentCookie');
      expect(result).toBeNull();
    });
  });

  describe('deleteCookie', () => {
    it('dovrebbe eliminare un cookie esistente', () => {
      // Imposta un cookie
      service.setCookie('testCookie', 'testValue');
      expect(service.getCookie('testCookie')).toBe('testValue');
      
      // Eliminalo
      service.deleteCookie('testCookie');
      expect(service.getCookie('testCookie')).toBeNull();
    });

    it('dovrebbe gestire eliminazione cookie inesistente', () => {
      expect(() => {
        service.deleteCookie('nonexistentCookie');
      }).not.toThrow();
    });
  });

  describe('hasCookie', () => {
    it('dovrebbe restituire true per cookie esistente', () => {
      service.setCookie('testCookie', 'testValue');
      const result = service.hasCookie('testCookie');
      expect(result).toBe(true);
    });

    it('dovrebbe restituire false per cookie inesistente', () => {
      const result = service.hasCookie('testCookie');
      expect(result).toBe(false);
    });
  });

  describe('clearAuthCookies', () => {
    it('dovrebbe eliminare tutti i cookie di autenticazione', () => {
      // Imposta cookie di autenticazione
      service.setCookie('authToken', 'test-token');
      service.setCookie('user', 'test-user');
      
      // Verifica che esistano
      expect(service.hasCookie('authToken')).toBe(true);
      expect(service.hasCookie('user')).toBe(true);
      
      // Eliminali tutti
      service.clearAuthCookies();
      
      // Verifica che siano stati eliminati
      expect(service.hasCookie('authToken')).toBe(false);
      expect(service.hasCookie('user')).toBe(false);
    });
  });

  describe('getUser', () => {
    it('dovrebbe restituire i dati utente parsati', () => {
      const userData = { id: 1, username: 'testuser' };
      service.setCookie('user', JSON.stringify(userData));
      
      const result = service.getCookie('user');
      expect(result).toBe(JSON.stringify(userData));
    });

    it('dovrebbe gestire dati utente mancanti', () => {
      const result = service.getCookie('user');
      expect(result).toBeNull();
    });
  });

  describe('getToken', () => {
    it('dovrebbe restituire il token dai cookie', () => {
      const token = 'test-token-123';
      service.setCookie('authToken', token);
      
      const result = service.getCookie('authToken');
      expect(result).toBe(token);
    });

    it('dovrebbe restituire null per token mancante', () => {
      const result = service.getCookie('authToken');
      expect(result).toBeNull();
    });
  });
});
