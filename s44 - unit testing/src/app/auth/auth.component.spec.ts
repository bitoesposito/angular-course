import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthComponent } from './auth.component';
import { AuthService } from './auth.service';
import { Validators } from '@angular/forms';
import { Observable } from 'rxjs';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  // Mock delle risposte del servizio
  const mockAuthResponse = {
    message: 'Login riuscito',
    token: 'mock-jwt-token',
    user: {
      id: 1,
      username: 'testuser',
      createdAt: '2024-01-01T00:00:00.000Z'
    }
  };

  beforeEach(async () => {
    // Crea spy per i servizi
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login', 
      'signup', 
      'saveAuthData'
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, AuthComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture.detectChanges();
  });

  it('dovrebbe creare il componente', () => {
    expect(component).toBeTruthy();
  });

  it('dovrebbe inizializzare in modalità login', () => {
    expect(component.isLoginMode).toBe(true);
  });

  it('dovrebbe inizializzare il form con validatori corretti', () => {
    const usernameControl = component.form.get('username');
    const passwordControl = component.form.get('password');

    // Verifica che i controlli esistano
    expect(usernameControl).toBeTruthy();
    expect(passwordControl).toBeTruthy();

    // Verifica i validatori
    expect(usernameControl?.errors?.['required']).toBeTruthy();
    expect(passwordControl?.errors?.['required']).toBeTruthy();
  });

  describe('onSwitchMode', () => {
    it('dovrebbe cambiare modalità da login a signup', () => {
      component.isLoginMode = true;
      component.errorMessage = 'Errore precedente';

      component.onSwitchMode();

      expect(component.isLoginMode).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('dovrebbe cambiare modalità da signup a login', () => {
      component.isLoginMode = false;
      component.errorMessage = 'Errore precedente';

      component.onSwitchMode();

      expect(component.isLoginMode).toBe(true);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      // Setup del form con dati validi
      component.form.patchValue({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('dovrebbe effettuare il login con successo', () => {
      // Mock del servizio di login
      authService.login.and.returnValue(of(mockAuthResponse));
      authService.saveAuthData.and.returnValue(undefined);

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(authService.saveAuthData).toHaveBeenCalledWith(
        mockAuthResponse.token, 
        mockAuthResponse.user
      );
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });

    it('dovrebbe effettuare la registrazione con successo', () => {
      component.isLoginMode = false;
      authService.signup.and.returnValue(of(mockAuthResponse));
      authService.saveAuthData.and.returnValue(undefined);

      component.onSubmit();

      expect(authService.signup).toHaveBeenCalledWith('testuser', 'password123');
      expect(authService.saveAuthData).toHaveBeenCalledWith(
        mockAuthResponse.token, 
        mockAuthResponse.user
      );
    });

    it('dovrebbe gestire errori di autenticazione', () => {
      const errorMessage = 'Credenziali non valide';
      const error = { error: { message: errorMessage } };
      
      authService.login.and.returnValue(throwError(() => error));

      component.onSubmit();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBe(false);
    });

    it('dovrebbe validare il form prima dell\'invio', () => {
      // Form vuoto (non valido)
      component.form.patchValue({
        username: '',
        password: ''
      });

      const markAllAsTouchedSpy = spyOn(component.form, 'markAllAsTouched');
      const updateValueAndValiditySpy = spyOn(component.form, 'updateValueAndValidity');

      component.onSubmit();

      expect(markAllAsTouchedSpy).toHaveBeenCalled();
      expect(updateValueAndValiditySpy).toHaveBeenCalled();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('dovrebbe validare la lunghezza minima del username', () => {
      component.form.patchValue({
        username: 'ab', // Troppo corto
        password: 'password123'
      });

      component.onSubmit();

      expect(component.form.valid).toBe(false);
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('dovrebbe validare la lunghezza minima della password', () => {
      component.form.patchValue({
        username: 'testuser',
        password: '123' // Troppo corta
      });

      component.onSubmit();

      expect(component.form.valid).toBe(false);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('Gestione stati del componente', () => {
    it('dovrebbe mostrare loading durante l\'autenticazione', () => {
      // Setup del form
      component.form.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      // Simula una richiesta lenta
      authService.login.and.returnValue(new Observable(observer => {
        setTimeout(() => {
          observer.next(mockAuthResponse);
          observer.complete();
        }, 100);
      }));

      component.onSubmit();

      expect(component.isLoading).toBe(true);
    });

    it('dovrebbe resettare il form dopo il successo', () => {
      // Setup del form
      component.form.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      authService.login.and.returnValue(of(mockAuthResponse));
      authService.saveAuthData.and.returnValue(undefined);

      const resetSpy = spyOn(component.form, 'reset');

      component.onSubmit();

      expect(resetSpy).toHaveBeenCalled();
    });
  });
});
