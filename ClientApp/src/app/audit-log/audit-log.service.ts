import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  constructor(private http: HttpClient) {}

  postAudit(data: any): Observable<any> {
    return this.http.post<any>(`${environment.appUrl}/api/Audit`, data);
  }

  // Get all audit logs
  getAllAudits(): Observable<any> {
    return this.http.get<any>(`${environment.appUrl}/api/Audit`);
  }

  // Helper method to create audit data
  createAuditData(firstName: string, action: string, itemName: string): any {
    // Get current time in Philippines timezone (UTC+8)
    const now = new Date();
    // Convert to Philippines timezone (UTC+8)
    const philippinesOffset = 8 * 60; // 8 hours in minutes
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const philippinesTime = new Date(utc + (philippinesOffset * 60000));
    
    return {
      id: 0,
      name: firstName,
      description: `${action} ${itemName}`,
      createdToday: philippinesTime.toISOString()
    };
  }
}
