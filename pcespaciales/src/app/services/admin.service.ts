import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Método para limpiar todos los usuarios (solo para desarrollo)
  clearUsers(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/usuario/clear`);
  }
}
