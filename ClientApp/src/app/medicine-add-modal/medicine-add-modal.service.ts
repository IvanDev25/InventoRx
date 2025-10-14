import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicineAddService {

  constructor(private http: HttpClient) {}

  getMedicineSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/MedicineSupplier`);
  }
  postMedicine(data: any): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/Medicine`, data);
  }

  updateMedicine(data: any): Observable<any> {
    return this.http.put<any>(`${environment.appUrl}/api/Medicine`, data);
  }

  postAudit(data: any): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/Audit`, data);
  }
}
