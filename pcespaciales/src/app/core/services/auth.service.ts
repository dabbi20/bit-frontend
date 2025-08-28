import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
  roles: string[];
  expiresIn?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/usuarios`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.currentUserSubject = new BehaviorSubject<User | null>(
      JSON.parse(localStorage.getItem('currentUser') || 'null')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  private setCurrentUser(user: User): void {
    console.log('Guardando usuario en localStorage:', user);
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      console.log('Usuario guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar el usuario en localStorage:', error);
      throw new Error('No se pudo guardar la sesión. Intente nuevamente.');
    }
  }

  login(email: string, password: string): Observable<User> {
    if (!email || !password) {
      return throwError(() => new Error('Por favor ingresa tu correo y contraseña'));
    }

    console.log('Enviando solicitud de login a:', `${this.apiUrl}/login`);
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }, { observe: 'response' }).pipe(
      map(response => {
        console.log('Respuesta del servidor (login):', response);
        
        if (!response || !response.body) {
          throw { 
            status: 500, 
            message: 'El servidor no devolvió una respuesta válida' 
          };
        }

        const responseData = response.body;
        
        if (!responseData.token) {
          console.error('Respuesta inesperada del servidor:', responseData);
          throw { 
            status: 500, 
            message: 'La respuesta del servidor no contiene un token de autenticación',
            details: responseData
          };
        }
        
        // Asegurarse de que la respuesta tenga la estructura esperada
        if (!responseData.id || !responseData.email) {
          console.error('Estructura de respuesta inesperada:', responseData);
          throw {
            status: 500,
            message: 'La respuesta del servidor no contiene los datos necesarios',
            details: responseData
          };
        }

        const userData: User = {
          id: responseData.id,
          email: responseData.email,
          name: responseData.name || responseData.email.split('@')[0],
          token: responseData.token,
          roles: responseData.roles || ['user'],
          expiresIn: responseData.expiresIn || 86400
        };
        
        console.log('Datos del usuario a guardar:', userData);

        console.log('Usuario autenticado:', userData);
        return userData;
      }),
      tap({
        next: (user) => {
          console.log('Estableciendo usuario actual...');
          this.setCurrentUser(user);
        },
        error: (error) => {
          console.error('Error en el login:', error);
        }
      }),
      catchError((error: any) => {
        console.error('Error en la petición de login:', error);
        let errorMessage = 'Error al iniciar sesión. Por favor verifica tus credenciales.';
        
        if (error.status === 400 || error.status === 401) {
          errorMessage = 'Correo o contraseña incorrectos';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        console.error('Error en login:', error);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (!user || !user.token) {
      return false;
    }
    
    // Verificar si el token ha expirado
    const tokenPayload = this.parseJwt(user.token);
    if (tokenPayload && tokenPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenPayload.exp < currentTime) {
        this.logout();
        return false;
      }
    }
    
    return true;
  }
  
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64));
    } catch (e) {
      return null;
    }
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    return user?.token || null;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.includes(role) : false;
  }

  logout(): void {
    // Eliminar el usuario del almacenamiento local
    localStorage.removeItem('currentUser');
    // Notificar a los suscriptores que el usuario ha cerrado sesión
    this.currentUserSubject.next(null);
    // Redirigir a la página de login
    this.router.navigate(['/auth/login']);
  }

  register(userData: { name: string; email: string; password: string; cell: string }): Observable<User> {
    if (!userData.name || !userData.email || !userData.password || !userData.cell) {
      return throwError(() => new Error('Por favor completa todos los campos requeridos'));
    }

    const userToRegister = {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      cell: userData.cell
    };

    console.log('Enviando datos de registro al backend:', userToRegister);

    return this.http.post<any>(this.apiUrl, userToRegister, { observe: 'response' }).pipe(
      map(response => {
        console.log('Respuesta del servidor (registro):', response);
        
        if (!response.body) {
          throw { 
            status: 500, 
            message: 'El servidor no devolvió una respuesta válida',
            details: response
          };
        }

        const responseData = response.body;
        
        // Check for successful registration (201 Created or 200 OK)
        if (response.status === 201 || response.status === 200) {
          // If registration was successful but no token is returned
          const user: User = { 
            id: responseData._id || responseData.id || '',
            email: responseData.email || userToRegister.email,
            name: responseData.name || userToRegister.name,
            token: responseData.token || '',
            roles: responseData.roles || ['user']
          };
          
          // Only set as current user if we have a token
          if (responseData.token) {
            console.log('Usuario registrado y autenticado exitosamente:', user);
            this.setCurrentUser(user);
          } else {
            console.log('Usuario registrado exitosamente. Por favor inicia sesión.');
          }
          
          return user;
        }

        // If we reach here, the response status was not 200/201
        throw { 
          status: response.status,
          message: 'La respuesta del servidor no fue exitosa',
          details: responseData
        };
      }),
      catchError((error: any) => {
        console.error('Error en el registro:', error);
        
        // Handle specific error cases
        let errorMessage = 'Error al registrar el usuario. Por favor intente de nuevo.';
        
        if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos de registro inválidos';
        } else if (error.status === 409 || error.status === 500) {
          // Handle duplicate email error (500 or 409 depending on backend)
          if (error.error?.code === 11000 || 
              error.error?.message?.includes('duplicate key') || 
              error.error?.message?.includes('ya existe')) {
            errorMessage = 'Este correo electrónico ya está registrado. Por favor utiliza otro correo o inicia sesión.';
          } else {
            errorMessage = error.error?.message || 'Error en el servidor al procesar el registro';
          }
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get the current user's profile
   * @returns Observable with user profile data
   */
  /**
   * Get the current user's profile
   * @returns Observable with user profile data
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/perfil`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Error al cargar el perfil del usuario';
        
        if (error.status === 401) {
          errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente';
          this.logout();
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
