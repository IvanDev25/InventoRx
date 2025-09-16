import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamFormService {

  constructor(private http: HttpClient) { }

  getCategory() {
    return this.http.get(`${environment.appUrl}/api/Category`);
  }

  createManager(manager: any) {
    return this.http.post(`${environment.appUrl}/api/Manager`, manager);
  }

  createTeam(Team: any) {
    return this.http.post(`${environment.appUrl}/api/Team`, Team);
  }
  
  createPlayers(players: any[]): Observable<any> {
    return this.http.post(`${environment.appUrl}/api/Players`, players, { responseType: 'text' });
  }
  
  
}
