import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard per proteggere le route che richiedono autenticazione
 * Verifica se l'utente è autenticato tramite cookie
 */
export const AuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se l'utente è autenticato tramite cookie
  if (authService.isAuthenticated()) {
    return true;
  }

  // Se non autenticato, reindirizza alla pagina di login
  router.navigate(['/auth']);
  return false;
};

/**
 * Guard per proteggere le route di login/registrazione
 * Reindirizza alla home se l'utente è già autenticato
 */
export const NoAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se l'utente è già autenticato, reindirizza alla home
  if (authService.isAuthenticated()) {
    router.navigate(['/home']);
    return false;
  }

  return true;
};