// src/app/services/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/model'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Registro de usuario
  registrarUsuario(usuario: Omit<Usuario, '_id' | 'isVerified' | 'emailToken' | 'createdAt'>) {
    return this.http.post(`${this.apiUrl}/usuario`, usuario);
  }

  // Iniciar sesión
  login(credenciales: { email: string, password: string }) {
    return this.http.post(`${this.apiUrl}/usuario/login`, credenciales);
  }

  // Obtener perfil del usuario
  getPerfil() {
    return this.http.get(`${this.apiUrl}/usuario/perfil`);
  }

  // Verificar email
  verificarEmail(token: string) {
    return this.http.get(`${this.apiUrl}/usuario/verify/${token}`);
  }

  // Obtener todos los usuarios
  getUsuarios() {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuario`);
  }
}