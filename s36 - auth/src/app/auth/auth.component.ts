import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.authService.getCurrentUser(token).subscribe({
        next: (res) => {
          console.log(res)
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err)
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          this.router.navigate(['/auth']);
        }
      })
    }
  }

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = ''; // Pulisce eventuali errori precedenti
  }

  form = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  })

  onSubmit() {
    const isFormValid = this.form.valid;

    if (!isFormValid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { username, password } = this.form.value;

    // Sceglie tra login e registrazione in base alla modalità
    const authObservable = this.isLoginMode 
      ? this.authService.login(username!, password!)
      : this.authService.signup(username!, password!);

    authObservable.subscribe({
      next: (response) => {
        console.log('Autenticazione riuscita:', response);
        // Salva il token nel localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Reset del form
        this.form.reset();
        this.isLoading = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Errore autenticazione:', error);
        this.errorMessage = error.error?.message || 'Errore durante l\'autenticazione';
        this.isLoading = false;
      }
    });
  }
}