import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) { }


  getCategory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.appUrl}/api/Category`);
  }
  
  getCategoryById(id: number) {
    return this.http.get(`${environment.appUrl}/api/Category/${id}`);
  }
  
  deleteCategory(id: number) {
    return this.http.delete(`${environment.appUrl}/api/Category/${id}`);
  }
  
  updateCategory(category: any) {
    return this.http.put(`${environment.appUrl}/api/Category/${category.id}`, category);
  }
  
  createCategory(category: any) {
    return this.http.post(`${environment.appUrl}/api/Category`, category);
  }
  
}
