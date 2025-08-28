import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión',
    data: { animation: 'loginPage' }
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    title: 'Registro',
    data: { animation: 'registerPage' }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
    data: { animation: 'authPage' }
  }
];
