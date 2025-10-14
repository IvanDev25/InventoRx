import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private http: HttpClient) { }

  getPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Patient`);
  }

  updateMedicines(medicines: any[]): Observable<any> {
    return this.http.put<any>(`${environment.appUrl}/api/Medicine/multiple`, medicines);
  }

  getAssignedMedicines(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Patient/${patientId}/assigned-medicines`);
  }

  getUnassignedMedicines(patientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Patient/${patientId}/unassigned-medicines`);
  }

  removeMedicinesFromPatient(patientId: number, medicineIds: number[]): Observable<any> {
    return this.http.delete(`${environment.appUrl}/api/Patient/${patientId}/remove-medicines`, {
      body: medicineIds,
      responseType: 'text' as 'json',
      observe: 'response'
    });
  }

  replacePatientMedicines(patientId: number, medicineIds: number[]): Observable<any> {
    return this.http.put(`${environment.appUrl}/api/Patient/${patientId}/replace-medicines`, medicineIds, {
      responseType: 'text' as 'json',
      observe: 'response'
    });
  }

  deletePatient(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.appUrl}/api/Patient/${id}`);
  }

  updatePatientMedicineQuantity(patientId: number, medicineId: number, quantityChange: number, operation: string): Observable<any> {
    return this.http.put<any>(`${environment.appUrl}/api/Patient/${patientId}/medicines/${medicineId}/quantity`, {
      quantityChange: quantityChange,
      operation: operation
    });
  }

  updatePatientAdmissionStatus(patientId: number, isAdmitted: boolean): Observable<any> {
    return this.http.put<any>(`${environment.appUrl}/api/Patient/${patientId}/admission-status`, {
      isAdmitted: isAdmitted
    });
  }

}
