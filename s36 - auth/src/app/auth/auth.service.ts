import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/auth';

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
   * @param token - JWT token
   * @returns Observable con dati utente
   */
  getCurrentUser(token: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Effettua il logout
   * @param token - JWT token
   * @returns Observable con messaggio di conferma
   */
  logout(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
}
