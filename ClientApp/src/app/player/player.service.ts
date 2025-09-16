import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  constructor(private http: HttpClient) { }

  getManagers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Manager`);
  }
  

  getPlayersByManagerId(managerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Manager/${managerId}/players`);
  }
  
}
