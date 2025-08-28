import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: any = null;
  hasToken: boolean = false;
  isAuthenticated: boolean = false;

  constructor() {
    this.loadUserData();
  }

  /**
   * Carica i dati dell'utente dai cookie
   */
  loadUserData(): void {
    this.user = this.authService.getUser();
    this.hasToken = !!this.authService.getToken();
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  /**
   * Effettua il logout e reindirizza alla pagina di login
   */
  logout(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.logout().subscribe({
        next: (response) => {
          console.log('✅ Logout effettuato:', response);
          this.authService.clearAuthData();
          this.router.navigate(['/auth']);
        },
        error: (error) => {
          console.error('❌ Errore durante il logout:', error);
          // Anche in caso di errore, elimina i cookie locali
          this.authService.clearAuthData();
          this.router.navigate(['/auth']);
        }
      });
    } else {
      // Se non c'è token, elimina comunque i cookie e reindirizza
      this.authService.clearAuthData();
      this.router.navigate(['/auth']);
    }
  }
} 