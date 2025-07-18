import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    console.log('Componente de login inicializado');
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Verificar si viene del registro exitoso
    this.route.queryParams.subscribe(params => {
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
    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        if (response.allOK) {
          // Redirigir a productos después del login exitoso
          this.router.navigate(['/productos']);
        } else {
          this.error = response.message || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.error = error.message || 'Error al iniciar sesión';
      }
    });
  }
}
