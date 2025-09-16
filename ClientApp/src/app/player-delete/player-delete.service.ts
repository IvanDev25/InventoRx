import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayersDeleteService {

  constructor(private http: HttpClient) { }

  deletePlayers(id: number) {
    return this.http.delete(`${environment.appUrl}/api/Players/${id}`);
  }
}
