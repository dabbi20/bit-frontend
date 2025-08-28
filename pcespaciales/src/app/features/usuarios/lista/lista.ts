import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista.html',
  styleUrls: ['./lista.css']
})
export class ListaUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  error: string = '';
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.loading = true;
    this.error = '';
    
    this.http.get<any>('/api/usuarios').subscribe({
      next: (response) => {
        this.loading = false;
        if (response && Array.isArray(response.data)) {
          this.usuarios = response.data;
        } else {
          this.error = 'Formato de respuesta inesperado';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Error al cargar usuarios';
        
        // Handle 401 unauthorized
        if (error.status === 401) {
          this.authService.logout();
        }
      }
    });
  }
}
