import { inject, Injectable } from "@angular/core";
import { AuthService } from "./auth.service";
import { CanActivate, CanActivateFn, Router } from "@angular/router";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/']);
      return of(false);
    }
    return this.authService.getCurrentUser(token).pipe(
      map((res) => {
        return true;
      }),
      catchError((err) => {
        this.router.navigate(['/']);
        return of(false);
        })
    )
  }
}