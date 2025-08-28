import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // No hacer nada para las rutas de autenticación
  if (req.url.includes('/api/usuarios/login') || req.url.includes('/api/usuarios/register')) {
    return next(req);
  }
  
  // Get the auth token from the service
  const currentUser = authService.currentUserValue;
  
  // Clone the request and add the authorization header if we have a token
  if (currentUser?.token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentUser.token}`
      }
    });
  }

  // Handle the request
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Auto logout if 401 response returned from API
        // Solo hacer logout si no estamos en una ruta de autenticación
        if (!req.url.includes('/api/usuarios/')) {
          authService.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
