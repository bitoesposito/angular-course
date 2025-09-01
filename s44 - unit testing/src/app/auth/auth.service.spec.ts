import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let cookieService: jasmine.SpyObj<CookieService>;

  // Mock dei dati di test
  const mockAuthResponse = {
    message: 'Login riuscito',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: 'testuser',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  };

  const mockUserResponse = {
    user: {
      id: 1,
      username: 'testuser',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  };

  beforeEach(() => {
    // Crea uno spy per CookieService con metodi mock
    const cookieServiceSpy = jasmine.createSpyObj('CookieService', [
      'getCookie', 
      'setCookie', 
      'deleteCookie',
      'hasCookie',
      'clearAuthCookies'
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: CookieService, useValue: cookieServiceSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    cookieService = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
  });

  afterEach(() => {
    // Verifica che non ci siano richieste HTTP non gestite
    httpMock.verify();
  });

  describe('Login', () => {
    it('dovrebbe effettuare il login con successo', () => {
      const username = 'testuser';
      const password = 'password123';

      // Esegui il metodo da testare
      service.login(username, password).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      // Simula la risposta HTTP
      const req = httpMock.expectOne('http://localhost:3001/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      
      // Invia la risposta mock
      req.flush(mockAuthResponse);
    });

    it('dovrebbe gestire errori di login', () => {
      const username = 'testuser';
      const password = 'wrongpassword';
      const errorMessage = 'Credenziali non valide';

      service.login(username, password).subscribe({
        next: () => fail('Dovrebbe fallire'),
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/login');
      req.flush(
        { message: errorMessage }, 
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('Signup', () => {
    it('dovrebbe registrare un nuovo utente con successo', () => {
      const username = 'newuser';
      const password = 'newpassword123';

      service.signup(username, password).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });
      
      req.flush(mockAuthResponse);
    });

    it('dovrebbe gestire errori di registrazione', () => {
      const username = 'existinguser';
      const password = 'password123';
      const errorMessage = 'Username già esistente';

      service.signup(username, password).subscribe({
        next: () => fail('Dovrebbe fallire'),
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/register');
      req.flush(
        { message: errorMessage }, 
        { status: 409, statusText: 'Conflict' }
      );
    });
  });

  describe('getCurrentUser', () => {
    it('dovrebbe ottenere i dati utente quando il token è presente', () => {
      // Mock del token nel cookie
      cookieService.getCookie.and.returnValue('valid-token');

      service.getCurrentUser().subscribe(response => {
        expect(response).toEqual(mockUserResponse);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/me');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer valid-token');
      
      req.flush(mockUserResponse);
    });

    it('dovrebbe lanciare un errore quando il token non è presente', () => {
      // Mock del token mancante
      cookieService.getCookie.and.returnValue(null);

      expect(() => service.getCurrentUser()).toThrowError('Token non trovato');
    });

    it('dovrebbe gestire errori HTTP durante getCurrentUser', () => {
      cookieService.getCookie.and.returnValue('valid-token');

      service.getCurrentUser().subscribe({
        next: () => fail('Dovrebbe fallire'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/me');
      req.flush(
        { message: 'Token non valido' }, 
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('Logout', () => {
    it('dovrebbe effettuare il logout con successo', () => {
      cookieService.getCookie.and.returnValue('valid-token');

      service.logout().subscribe((response: { message: string }) => {
        expect(response.message).toBe('Logout effettuato con successo');
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe('Bearer valid-token');
      
      req.flush({ message: 'Logout effettuato con successo' });
    });

    it('dovrebbe lanciare un errore durante il logout senza token', () => {
      cookieService.getCookie.and.returnValue(null);

      expect(() => service.logout()).toThrowError('Token non trovato');
    });

    it('dovrebbe gestire errori HTTP durante il logout', () => {
      cookieService.getCookie.and.returnValue('valid-token');

      service.logout().subscribe({
        next: () => fail('Dovrebbe fallire'),
        error: (error: any) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/logout');
      req.flush(
        { message: 'Errore server' }, 
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('Gestione token', () => {
    it('dovrebbe salvare i dati di autenticazione nei cookie', () => {
      const token = 'new-token';
      const user = { id: 1, username: 'user', createdAt: '2024-01-01' };

      // Mock dei metodi del cookie service
      cookieService.setCookie.and.returnValue(undefined);

      service.saveAuthData(token, user);

      expect(cookieService.setCookie).toHaveBeenCalledWith('authToken', token, 7);
      expect(cookieService.setCookie).toHaveBeenCalledWith('user', JSON.stringify(user), 7);
    });

    it('dovrebbe verificare se l\'utente è autenticato', () => {
      // Test con token presente
      cookieService.hasCookie.and.returnValue(true);
      expect(service.isAuthenticated()).toBe(true);

      // Test senza token
      cookieService.hasCookie.and.returnValue(false);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('dovrebbe ottenere il token dai cookie', () => {
      const expectedToken = 'test-token';
      cookieService.getCookie.and.returnValue(expectedToken);

      const result = service.getToken();
      expect(result).toBe(expectedToken);
      expect(cookieService.getCookie).toHaveBeenCalledWith('authToken');
    });

    it('dovrebbe ottenere i dati utente dai cookie', () => {
      const userData = { id: 1, username: 'testuser' };
      cookieService.getCookie.and.returnValue(JSON.stringify(userData));

      const result = service.getUser();
      expect(result).toEqual(userData);
      expect(cookieService.getCookie).toHaveBeenCalledWith('user');
    });

    it('dovrebbe gestire dati utente mancanti', () => {
      cookieService.getCookie.and.returnValue(null);

      const result = service.getUser();
      expect(result).toBeNull();
    });

    it('dovrebbe eliminare i dati di autenticazione', () => {
      service.clearAuthData();

      expect(cookieService.clearAuthCookies).toHaveBeenCalled();
    });
  });
});
