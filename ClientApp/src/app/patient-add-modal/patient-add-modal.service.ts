import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientAddService {

  constructor(private http: HttpClient) { }

  getMedicines(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Medicine`);
  }

  postPatient(data: any): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/Patient`, data, { 
      responseType: 'text' as 'json',
      observe: 'response' 
    });
  }

  updatePatient(patientId: number, data: any): Observable<any> {
    return this.http.put(`${environment.appUrl}/api/Patient/${patientId}`, data, {
      responseType: 'text' as 'json',
      observe: 'response'
    });
  }

  getLatestPatient(): Observable<any> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Patient`);
  }

  assignMedicinesToPatient(patientId: number, medicineIds: number[]): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/Patient/${patientId}/assign-medicines`, medicineIds, {
      responseType: 'text' as 'json',
      observe: 'response'
    });
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

}
