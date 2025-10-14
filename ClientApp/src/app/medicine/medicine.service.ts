import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {

  constructor(private http: HttpClient) { }

  getMedicine(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Medicine`);
  }
  
  deleteMedicine(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.appUrl}/api/Medicine/${id}`);
  }

  refillMedicine(id: number, quantity: number): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/Medicine/${id}/refill`, { quantity });
  }
}
