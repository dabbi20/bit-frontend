import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { preload: true } // Precargar el dashboard
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    data: { preload: false } // No precargar rutas de autenticación inicialmente
  },
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules, // Precargar módulos en segundo plano
    enableTracing: false, // Solo para depuración
    scrollPositionRestoration: 'enabled', // Restaurar posición de desplazamiento
    anchorScrolling: 'enabled', // Soporte para anclas
    onSameUrlNavigation: 'reload' // Recargar en la misma URL si es necesario
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
