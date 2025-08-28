import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm!: FormGroup;
  error: string = '';
  success: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    console.log('Componente de login inicializado');
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Verificar si viene del registro exitoso
    this.route.queryParams.subscribe((params: any) => {
      if (params['success']) {
        this.success = params['success'];
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (response: any) => {
        if (response.allOK) {
          // Redirigir a productos después del login exitoso
          this.router.navigate(['/productos']);
        } else {
          this.error = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error: any) => {
        this.error = error.message || 'Error al iniciar sesión';
      }
    });
  }
}
