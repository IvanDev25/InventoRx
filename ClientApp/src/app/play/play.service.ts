import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayService {

  constructor(private http: HttpClient) { }


  getUsers() {
    return this.http.get(`${environment.appUrl}/api/Account/get-all-users`);
  }
  getUserById() {
    return this.http.get(`${environment.appUrl}/api/Account/get-user{id}`)
  }

  getAdminPermission() {
    return this.http.get<any[]>(`${environment.appUrl}/api/AdminPermission`);
  }
  
}
