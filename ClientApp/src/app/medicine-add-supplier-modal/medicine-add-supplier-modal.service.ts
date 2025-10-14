import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicineSupplierService {

  constructor(private http: HttpClient) {}

  getMedicineSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/MedicineSupplier`);
  }

  getMedicineSupplierById(id: number): Observable<any> {
    return this.http.get<any>(`${environment.appUrl}/api/MedicineSupplier/${id}`);
  }

  postMedicineSupplier(data: any): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/MedicineSupplier`, data);
  }

  updateMedicineSupplier(data: any): Observable<any> {
    return this.http.put<any>(`${environment.appUrl}/api/MedicineSupplier`, data);
  }

  deleteMedicineSupplier(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.appUrl}/api/MedicineSupplier/${id}`);
  }
}
