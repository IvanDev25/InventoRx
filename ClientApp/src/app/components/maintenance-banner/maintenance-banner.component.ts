import { Component, OnInit, OnDestroy } from '@angular/core';
import { MaintenanceService } from '../../services/maintenance.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-maintenance-banner',
  templateUrl: './maintenance-banner.component.html',
  styleUrls: ['./maintenance-banner.component.scss']
})
export class MaintenanceBannerComponent implements OnInit, OnDestroy {
  maintenanceEnabled: boolean = false;
  bannerVisible: boolean = false;
  private subscription?: Subscription;

  constructor(private maintenanceService: MaintenanceService) {}

  ngOnInit(): void {
    this.maintenanceEnabled = this.maintenanceService.getMaintenanceEnabled();
    this.subscription = this.maintenanceService.maintenanceEnabled$.subscribe(enabled => {
      this.maintenanceEnabled = enabled;
      if (enabled) {
        // Add visible class after entrance animation completes
        setTimeout(() => {
          this.bannerVisible = true;
        }, 800);
      } else {
        this.bannerVisible = false;
      }
    });
    
    // Set visible state if already enabled
    if (this.maintenanceEnabled) {
      setTimeout(() => {
        this.bannerVisible = true;
      }, 800);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

