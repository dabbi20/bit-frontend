import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../../../services/usuario.service';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styles: []
})
export class RegisterComponent {
  registerForm!: FormGroup;
  error: string = '';
  success: string = '';
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private adminService: AdminService
  ) {
    this.registerForm = this.formBuilder.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cell: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });

    // Verificar si hay un mensaje de éxito en los queryParams
    this.router.navigate([], {
      queryParams: {
        success: null
      },
      queryParamsHandling: 'merge'
    });
  }

  clearUsers(): void {
    this.loading = true;
    this.adminService.clearUsers().subscribe({
      next: (response) => {
        if (response.allOK) {
          this.success = response.message;
          this.error = '';
          setTimeout(() => {
            this.success = '';
          }, 3000);
        }
      },
      error: (error) => {
        this.error = error.message;
        this.success = '';
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      const usuario = {
        nombres: this.registerForm.value.nombres,
        apellidos: this.registerForm.value.apellidos,
        email: this.registerForm.value.email,
        cell: this.registerForm.value.cell,
        password: this.registerForm.value.password
      };

      console.log('Enviando datos de registro:', usuario);

      this.usuarioService.registrarUsuario(usuario).subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
          if (response.allOK) {
            console.log('Registro exitoso, redirigiendo al login...');
            // Limpiar el formulario
            this.registerForm.reset();
            // Redirigir al login usando el router de Angular
            console.log('Forzando redirección al login...');
            this.router.navigate(['/auth/login'], {
              queryParams: {
                success: '¡Registro exitoso! Ahora puedes iniciar sesión.'
              },
              replaceUrl: true
            }).then(success => {
              console.log('Redirección exitosa:', success);
            }).catch(error => {
              console.error('Error en la redirección:', error);
              this.error = 'Error al redirigir al login. Por favor intenta nuevamente.';
            });
          } else {
            console.log('Error en la respuesta del backend:', response.message);
            this.error = response.message || 'Error al registrar el usuario. Por favor intenta nuevamente.';
          }
        },
        error: (error: any) => {
          console.error('Error en el servicio:', error);
          // Intentar obtener detalles específicos del error del backend
          let errorMessage = 'Error al registrar usuario.';
          if (error.error && typeof error.error === 'object') {
            errorMessage = error.error.message || errorMessage;
          } else if (error.error) {
            errorMessage = error.error;
          }
          
          // Manejar errores específicos del backend
          if (errorMessage.includes('duplicate key')) {
            errorMessage = 'Este correo electrónico ya está registrado.';
          } else if (errorMessage.includes('validation failed')) {
            errorMessage = 'Los datos proporcionados no son válidos.';
          }
          
          console.log('Error final:', errorMessage);
          this.error = errorMessage;
        },
        complete: () => {
          console.log('Proceso de registro completado');
          this.loading = false;
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores de validación
      Object.values(this.registerForm.controls).forEach(control => {
        control.markAsTouched();
      });

      // Recopilar todos los errores de validación
      const errors: string[] = [];
      Object.values(this.registerForm.controls).forEach(control => {
        if (control.errors) {
          if (control.errors['required']) {
            errors.push(`El campo ${control.value} es requerido`);
          }
          if (control.errors['email']) {
            errors.push('Por favor ingresa un email válido');
          }
          if (control.errors['minlength']) {
            errors.push(`El campo ${control.value} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`);
          }
          if (control.errors['mustMatch']) {
            errors.push('Las contraseñas no coinciden');
          }
        }
      });

      this.error = errors.length > 0 ? errors.join(' ') : 'Por favor completa todos los campos requeridos.';
    }
  }

  private passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mustMatch: true });
    } else {
      confirmPassword?.setErrors(null);
    }
  }
}
