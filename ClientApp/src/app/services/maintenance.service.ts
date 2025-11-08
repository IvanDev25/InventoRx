import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private maintenanceEnabledSubject = new BehaviorSubject<boolean>(false);
  public maintenanceEnabled$: Observable<boolean> = this.maintenanceEnabledSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load state from backend on service initialization
    this.loadMaintenanceState();
  }

  private loadMaintenanceState(): void {
    this.http.get<any>(`${environment.appUrl}/api/MaintenanceSettings`).pipe(
      catchError(error => {
        console.error('Error loading maintenance settings:', error);
        // Return default settings on error
        return of({ id: 1, display: false });
      })
    ).subscribe({
      next: (settings) => {
        const display = settings?.display ?? false;
        this.maintenanceEnabledSubject.next(display);
      },
      error: (error) => {
        console.error('Error loading maintenance settings:', error);
        this.maintenanceEnabledSubject.next(false);
      }
    });
  }

  getMaintenanceEnabled(): boolean {
    return this.maintenanceEnabledSubject.value;
  }

  setMaintenanceEnabled(enabled: boolean): void {
    const settings = { id: 1, display: enabled };
    
    this.http.put<any>(`${environment.appUrl}/api/MaintenanceSettings`, settings).pipe(
      catchError(error => {
        console.error('Error updating maintenance settings:', error);
        throw error;
      }),
      tap(() => {
        // Update local state on success
        this.maintenanceEnabledSubject.next(enabled);
      })
    ).subscribe({
      next: () => {
        // State already updated in tap
      },
      error: (error) => {
        console.error('Error updating maintenance settings:', error);
      }
    });
  }

  toggleMaintenanceMessage(): void {
    const currentValue = this.maintenanceEnabledSubject.value;
    this.setMaintenanceEnabled(!currentValue);
  }
}












