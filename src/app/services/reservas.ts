import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Reservas {

  private baseUrl = 'http://127.0.0.1:8000/api';
  private apiUrl = `${this.baseUrl}/reservaciones`;

  constructor(private http: HttpClient) { }

  getReservaciones(pagina: number = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}?page=${pagina}`);
  }

  getReservacion(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  crearReservacion(reserva: any): Observable<any> {
    return this.http.post(this.apiUrl, reserva);
  }

  actualizarReservacion(id: number, reserva: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, reserva);
  }

  eliminarReservacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getClientes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clientes`);
  }

  getTours(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tours`);
  }
}