import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryDeleteService {

  constructor(private http: HttpClient) { }


  getCategory() {
    return this.http.get(`${environment.appUrl}/api/Category`);
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
