// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { HeaderComponent } from './shared/header/header';
import { FooterComponent } from './shared/footer/footer';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: HeaderComponent, useValue: HeaderComponent },
    { provide: FooterComponent, useValue: FooterComponent },
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};