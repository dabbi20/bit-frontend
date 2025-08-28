import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  loading = false;

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores de validación
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    const { email, password } = this.loginForm.value;
    
    console.log('Enviando credenciales de login...');
    this.authService.login(email, password).subscribe({
      next: (user: User) => {
        console.log('Login exitoso, redirigiendo...', user);
        this.loading = false;
        // Forzar la recarga de la aplicación
        this.router.navigate(['/dashboard']).then(() => {
          window.location.reload();
        });
      },
      error: (error: any) => {
        console.error('Error en el login:', error);
        this.loading = false;
        
        // Determinar el mensaje de error basado en el tipo de error
        let errorMessage = 'Error al iniciar sesión. Por favor verifica tus credenciales.';
        
        if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (error.status === 401 || error.status === 400) {
          errorMessage = 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.';
        } else if (error.status === 500) {
          errorMessage = 'Error en el servidor. Por favor inténtalo de nuevo más tarde.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.error = errorMessage;
        this.loading = false;
        
        // Hacer scroll al mensaje de error para mejor visibilidad
        setTimeout(() => {
          const errorElement = document.querySelector('.error-message');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    });
  }
}
