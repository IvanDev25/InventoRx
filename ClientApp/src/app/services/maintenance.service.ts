import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {
  private maintenanceEnabledSubject = new BehaviorSubject<boolean>(false);
  public maintenanceEnabled$: Observable<boolean> = this.maintenanceEnabledSubject.asObservable();

  constructor() {
    // Load state from localStorage on service initialization
    this.loadMaintenanceState();
  }

  private loadMaintenanceState(): void {
    const savedState = localStorage.getItem('maintenanceMessageEnabled');
    if (savedState !== null) {
      this.maintenanceEnabledSubject.next(savedState === 'true');
    }
  }

  getMaintenanceEnabled(): boolean {
    return this.maintenanceEnabledSubject.value;
  }

  setMaintenanceEnabled(enabled: boolean): void {
    this.maintenanceEnabledSubject.next(enabled);
    localStorage.setItem('maintenanceMessageEnabled', String(enabled));
  }

  toggleMaintenanceMessage(): void {
    const currentValue = this.maintenanceEnabledSubject.value;
    this.setMaintenanceEnabled(!currentValue);
  }
}




