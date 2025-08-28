import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error = '';
  loading = false;
  success = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      cell: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = '';
    const { name, email, password, cell } = this.registerForm.value;
    
    console.log('Attempting to register user:', { email });
    
    // Prepare user data for registration
    const userData = {
      name: name.trim(),
      email,
      cell,
      password
    };

    // Use AuthService for registration
    this.authService.register(userData).subscribe({
      next: (user: any) => {
        console.log('Registration successful, response:', user);
        this.success = true;
        this.loading = false;
        
        // Auto login after successful registration
        console.log('Attempting auto login...');
        this.authService.login(email, password).subscribe({
          next: () => {
            console.log('Auto login successful');
            this.router.navigate(['/dashboard']);
          },
          error: (loginError: any) => {
            console.error('Auto login error:', loginError);
            // If registration was successful but login fails, redirect to login page
            this.router.navigate(['/auth/login'], { 
              queryParams: { registered: 'true' } 
            });
          }
        });
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        this.loading = false;
        
        // Detailed error handling
        if (error.status === 400 && error.error && error.error.message) {
          this.error = error.error.message;
        } else if (error.status === 0) {
          this.error = 'Could not connect to server. Please check your internet connection.';
        } else if (error.status === 500) {
          this.error = 'Server error. Please try again later.';
        } else {
          this.error = 'Registration error. Please check your information.';
        }
        
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
