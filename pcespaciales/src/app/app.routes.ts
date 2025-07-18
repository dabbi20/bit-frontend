// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register';
import { ListaUsuariosComponent } from './features/usuarios/lista/lista';
import { LoginComponent } from './features/auth/login/login';
import { ProductosComponent } from './features/productos/productos';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/productos', pathMatch: 'full' },
  { path: 'registro', component: RegisterComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'productos', 
    component: ProductosComponent,
    canActivate: [AuthGuard]
  },
  { path: 'usuarios', 
    component: ListaUsuariosComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/registro' }
];