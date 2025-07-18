import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  searchTerm: string = '';
  cartCount: number = 0;
  username: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Suscribirse a cambios en el usuario actual
    this.authService.usuarioActual$.subscribe(usuario => {
      this.username = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario';
    });
    
    // Simular obtener el conteo del carrito
    this.cartCount = 0;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  search(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/productos'], { queryParams: { search: this.searchTerm } });
    }
  }
}
