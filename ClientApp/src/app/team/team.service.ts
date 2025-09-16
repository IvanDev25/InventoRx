import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  constructor(private http: HttpClient) { }


  getTeams(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Team`);
  }
  
  getTeamById(id: number) {
    return this.http.get(`${environment.appUrl}/api/Team/${id}`);
  }
  
}
