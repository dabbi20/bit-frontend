// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioActualSubject = new BehaviorSubject<any>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      this.obtenerPerfil();
    }
  }

  getUsername(): string | null {
    const usuario = this.usuarioActualSubject.value;
    return usuario ? `${usuario.nombres} ${usuario.apellidos}` : null;
  }

  registerUsuario(usuario: {
    nombres: string,
    apellidos: string,
    email: string,
    cell: string,
    password: string
  }): Observable<any> {
    return this.usuarioService.registrarUsuario(usuario);
  }

  login(credenciales: { email: string, password: string }): Observable<any> {
    return new Observable(observer => {
      this.usuarioService.login(credenciales).subscribe({
        next: (response: any) => {
          if (response.allOK && response.data?.token) {
            localStorage.setItem('token', response.data.token);
            this.usuarioActualSubject.next(response.data.usuario);
          }
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
          observer.complete();
        }
      });
    });
  }

  obtenerPerfil(): void {
    this.usuarioService.getPerfil().subscribe({
      next: (usuario: any) => {
        this.usuarioActualSubject.next(usuario);
      },
      error: () => {
        this.logout();
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    this.usuarioActualSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
