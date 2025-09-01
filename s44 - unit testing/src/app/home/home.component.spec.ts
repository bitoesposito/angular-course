import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HomeComponent } from './home.component';
import { AuthService } from '../auth/auth.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    createdAt: '2024-01-01T00:00:00.000Z'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'getUser', 'getToken', 'isAuthenticated', 'logout', 'clearAuthData'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    
    // Ottieni gli spy dal TestBed
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    // Assicurati che i metodi mock restituiscano i valori corretti
    authService.getUser.and.returnValue(null);
    authService.getToken.and.returnValue(null);
    authService.isAuthenticated.and.returnValue(false);
  });

  it('dovrebbe creare il componente', () => {
    expect(component).toBeTruthy();
  });

  describe('loadUserData', () => {
    it('dovrebbe caricare i dati utente dai cookie', () => {
      authService.getUser.and.returnValue(mockUser);
      authService.getToken.and.returnValue('valid-token');
      authService.isAuthenticated.and.returnValue(true);

      component.loadUserData();

      expect(component.user).toEqual(mockUser);
      expect(component.hasToken).toBe(true);
      expect(component.isAuthenticated).toBe(true);
    });

    it('dovrebbe gestire utente non autenticato', () => {
      authService.getUser.and.returnValue(null);
      authService.getToken.and.returnValue(null);
      authService.isAuthenticated.and.returnValue(false);

      component.loadUserData();

      expect(component.user).toBeNull();
      expect(component.hasToken).toBe(false);
      expect(component.isAuthenticated).toBe(false);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      authService.clearAuthData.and.returnValue(undefined);
    });

    it('dovrebbe effettuare il logout con successo', (done) => {
      // Configura i mock prima del test
      authService.isAuthenticated.and.returnValue(true);
      authService.logout.and.returnValue(of({ message: 'Logout effettuato' }));
      
      // Ricarica i dati utente per aggiornare lo stato
      component.loadUserData();

      component.logout();

      // Aspetta che l'Observable si completi
      setTimeout(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(authService.clearAuthData).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/auth']);
        done();
      }, 0);
    });

    it('dovrebbe gestire errori di logout', (done) => {
      // Configura i mock prima del test
      authService.isAuthenticated.and.returnValue(true);
      const error = { status: 404, message: 'Not Found' };
      authService.logout.and.returnValue(throwError(() => error));
      
      // Ricarica i dati utente per aggiornare lo stato
      component.loadUserData();

      component.logout();

      // Aspetta che l'Observable si completi
      setTimeout(() => {
        expect(authService.logout).toHaveBeenCalled();
        expect(authService.clearAuthData).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/auth']);
        done();
      }, 0);
    });

    it('dovrebbe gestire logout senza autenticazione', () => {
      authService.isAuthenticated.and.returnValue(false);

      component.logout();

      expect(authService.logout).not.toHaveBeenCalled();
      expect(authService.clearAuthData).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth']);
    });
  });
});
