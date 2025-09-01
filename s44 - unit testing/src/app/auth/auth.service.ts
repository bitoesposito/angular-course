import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CookieService } from './cookie.service';

// Interfacce per le risposte API
interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
    createdAt: string;
  };
}

interface UserResponse {
  user: {
    id: number;
    username: string;
    createdAt: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3001/api/auth';

  constructor(
    private cookieService: CookieService,
    private http: HttpClient
  ) {
    const token = this.cookieService.getCookie('authToken');
    if (token) {
      this.getCurrentUser().subscribe({
        next: (res) => {
          // Token valido trovato, utente autenticato
        }
      })
    }
  }

  /**
   * Effettua il login dell'utente
   * @param username - Nome utente
   * @param password - Password
   * @returns Observable con token e dati utente
   */
  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      username,
      password,
    });
  }

  /**
   * Registra un nuovo utente
   * @param username - Nome utente
   * @param password - Password
   * @returns Observable con token e dati utente
   */
  signup(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      username,
      password,
    });
  }

  /**
   * Ottiene i dati dell'utente corrente
   * @returns Observable con dati utente
   */
  getCurrentUser(): Observable<UserResponse> {
    const token = this.cookieService.getCookie('authToken');
    if (!token) {
      throw new Error('Token non trovato');
    }
    
    return this.http.get<UserResponse>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Salva i dati di autenticazione nei cookie
   * @param token - JWT token
   * @param user - Dati utente
   */
  saveAuthData(token: string, user: any): void {
    this.cookieService.setCookie('authToken', token, 7); // 7 giorni
    this.cookieService.setCookie('user', JSON.stringify(user), 7);
  }

  /**
   * Ottiene il token dai cookie
   * @returns Token o null se non trovato
   */
  getToken(): string | null {
    return this.cookieService.getCookie('authToken');
  }

  /**
   * Ottiene i dati utente dai cookie
   * @returns Dati utente o null se non trovato
   */
  getUser(): any {
    const userCookie = this.cookieService.getCookie('user');
    return userCookie ? JSON.parse(userCookie) : null;
  }

  /**
   * Verifica se l'utente è autenticato
   * @returns true se autenticato
   */
  isAuthenticated(): boolean {
    return this.cookieService.hasCookie('authToken');
  }

  /**
   * Elimina tutti i dati di autenticazione
   */
  clearAuthData(): void {
    this.cookieService.clearAuthCookies();
  }

  /**
   * Effettua il logout dell'utente
   * @returns Observable con messaggio di conferma
   */
  logout(): Observable<{ message: string }> {
    const token = this.cookieService.getCookie('authToken');
    if (!token) {
      throw new Error('Token non trovato');
    }
    
    return this.http.post<{ message: string }>(`${this.apiUrl}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}
