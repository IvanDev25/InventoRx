import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  medicineSuppliers: any[] = [];
  filteredMedicineSuppliers: any[] = [];
  loading: boolean = true;
  searchTerm: string = '';

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMedicineSuppliers();
  }

  loadMedicineSuppliers(): void {
    this.dashboardService.getMedicineSuppliers().subscribe({
      next: (suppliers) => {
        this.medicineSuppliers = suppliers;
        this.filteredMedicineSuppliers = suppliers;
        this.loading = false;
        this.cdr.detectChanges(); // Trigger change detection manually
      },
      error: (error) => {
        console.error('Error loading medicine suppliers:', error);
        this.loading = false;
        this.cdr.detectChanges(); // Trigger change detection manually
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm.toLowerCase().trim();
    
    if (!this.searchTerm) {
      // If search is empty, show all suppliers with all medicines
      this.filteredMedicineSuppliers = this.medicineSuppliers;
    } else {
      // Filter suppliers and their medicines based on search term
      this.filteredMedicineSuppliers = this.medicineSuppliers.map(supplier => {
        const filteredMedicines = supplier.medicines.filter((medicine: any) => 
          medicine.genericName.toLowerCase().includes(this.searchTerm)
        );
        
        // Only include supplier if it has matching medicines
        if (filteredMedicines.length > 0) {
          return {
            ...supplier,
            medicines: filteredMedicines
          };
        }
        return null;
      }).filter(supplier => supplier !== null);
    }
    
    this.cdr.detectChanges();
  }

  getTotalFilteredMedicines(): number {
    return this.filteredMedicineSuppliers.reduce((total, supplier) => {
      return total + (supplier.medicines ? supplier.medicines.length : 0);
    }, 0);
  }

  getStatusClass(medicine: any): string {
    if (medicine.stock === 0) {
      return 'no-stock';
    } else if (medicine.stock < 20) {
      return 'low-stock';
    } else if (this.isExpiringSoon(medicine.expirationDate)) {
      return 'expiry-soon';
    } else {
      return 'in-stock';
    }
  }

  getStatusText(medicine: any): string {
    if (medicine.stock === 0) {
      return 'No Stock';
    } else if (medicine.stock < 20) {
      return 'Low Stock';
    } else if (this.isExpiringSoon(medicine.expirationDate)) {
      return 'Near Exp';
    } else {
      return 'In Stock';
    }
  }

  private isExpiringSoon(expirationDate: string): boolean {
    const expDate = new Date(expirationDate);
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
    return expDate <= oneMonthFromNow;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }
}
