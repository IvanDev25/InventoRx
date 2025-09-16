import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { AdminPermission } from '../account/permission/admin-permission.guard';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private http: HttpClient) { }

  getAdminPermission(id: string): Observable<AdminPermission> {
    return this.http.get<AdminPermission>(`${environment.appUrl}/api/AdminPermission/${id}`);
  }

}
