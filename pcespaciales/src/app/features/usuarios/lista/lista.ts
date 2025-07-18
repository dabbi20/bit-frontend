import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista.html',
  styleUrls: ['./lista.css']
})
export class ListaUsuariosComponent {
  usuarios: any[] = [];
  error: string = '';

  constructor(private usuarioService: UsuarioService) {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (response) => {
        if (response.allOK && response.data) {
          this.usuarios = response.data;
        }
      },
      error: (error) => {
        this.error = error.message || 'Error al cargar usuarios';
      }
    });
  }
}
