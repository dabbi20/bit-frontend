import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

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

  private authService = inject(AuthService);
  private router = inject(Router);
  
  constructor() {
    // Subscribe to current user changes
    this.authService.currentUser.subscribe((user: User | null) => {
      this.username = user?.name || 'Usuario';
    });
    
    // Simulate getting cart count
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
