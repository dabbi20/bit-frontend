import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error: string | null = null;

  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Initialize with current user if available
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.user = currentUser;
    }
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    this.error = null;
    
    this.authService.getProfile().subscribe({
      next: (user: User) => {
        this.user = user;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
        this.error = error.message || 'Failed to load user profile';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
