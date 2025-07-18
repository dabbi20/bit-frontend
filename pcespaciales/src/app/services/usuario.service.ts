// src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface ApiResponse {
  allOK: boolean;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Registro de usuario
  registrarUsuario(usuario: {
    nombres: string,
    apellidos: string,
    email: string,
    cell: string,
    password: string
  }): Observable<ApiResponse> {
    // Formatear los datos para el backend
    const userData = {
      nombres: usuario.nombres.trim(),
      apellidos: usuario.apellidos.trim(),
      email: usuario.email.toLowerCase().trim(),
      cell: usuario.cell.trim(),
      password: usuario.password
    };

    return this.http.post<ApiResponse>(`${this.apiUrl}/usuario`, userData)
      .pipe(
        map((response: ApiResponse) => {
          // Si el registro es exitoso, redirigir al login
          if (response.allOK) {
            return response;
          }
          throw new Error(response.message || 'Error al registrar usuario');
        }),
        catchError(error => {
          console.error('Error al registrar usuario:', error);
          let errorMessage = 'Error al registrar usuario. Por favor verifica:';
          
          // Intentar obtener detalles específicos del error del backend
          if (error.error && typeof error.error === 'object') {
            errorMessage = error.error.message || errorMessage;
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = error.error;
          }
          
          // Manejar errores específicos
          if (errorMessage.includes('duplicate key')) {
            errorMessage = 'Este correo electrónico ya está registrado.';
          } else if (errorMessage.includes('validation failed')) {
            errorMessage = 'Los datos proporcionados no son válidos.';
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Iniciar sesión
  login(credenciales: { email: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuario/login`, credenciales)
      .pipe(
        catchError(error => {
          console.error('Error al iniciar sesión:', error);
          return throwError(() => new Error('Error al iniciar sesión. Por favor verifica tus credenciales.'));
        })
      );
  }

  // Obtener perfil del usuario
  getPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/perfil`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener perfil:', error);
          return throwError(() => new Error('Error al obtener el perfil del usuario.'));
        })
      );
  }

  // Verificar email
  verificarEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario/verify/${token}`)
      .pipe(
        catchError(error => {
          console.error('Error al verificar email:', error);
          return throwError(() => new Error('Error al verificar el email. Por favor intenta nuevamente.'));
        })
      );
  }

  // Obtener todos los usuarios
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuario`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener usuarios:', error);
          return throwError(() => new Error('Error al obtener la lista de usuarios.'));
        })
      );
  }
}