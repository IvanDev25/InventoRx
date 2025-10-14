import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MedicineService } from './medicine.service';
import { MedicineAddSupplierModalComponent } from '../medicine-add-supplier-modal/medicine-add-supplier-modal.component';
import { MedicineAddModalComponent } from '../medicine-add-modal/medicine-add-modal.component';
import { MedicineEditModalComponent } from '../medicine-edit-modal/medicine-edit-modal.component';
import { MedicineDeleteModalComponent } from '../medicine-delete-modal/medicine-delete-modal.component';
import { AccountService } from '../account/account.service';

import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { AuditService } from '../audit-log/audit-log.service';

@Component({
  selector: 'app-medicine',
  templateUrl: './medicine.component.html',
  styleUrls: ['./medicine.component.scss']
})
export class MedicineComponent {
  displayedColumns: string[] = ['genericName','supplierName', 'price', 'stock', 'expirationDate', 'status', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  allMedicines: any[] = []; // Store all medicines for pagination
  originalMedicines: any[] = []; // Store original data for filtering

  @ViewChild(MatSort) sort!: MatSort;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // Refill state management
  refillingMedicineId: number | null = null;
  refillQuantity: number = 0;

  constructor(
    private medicineService: MedicineService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.medicineService.getMedicine().subscribe(
      (data) => {
        // Sort medicines to prioritize Low Stock items at the top
        const sortedData = this.sortMedicinesByPriority(data);
        this.originalMedicines = sortedData;
        this.allMedicines = sortedData;
        this.totalItems = sortedData.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.updateDisplayedData();

        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching medicines:', error);
      }
    );
  }

  private sortMedicinesByPriority(medicines: any[]): any[] {
    return medicines.sort((a, b) => {
      const aHasLowStock = this.hasLowStock(a.status);
      const bHasLowStock = this.hasLowStock(b.status);
      
      // Low Stock items come first
      if (aHasLowStock && !bHasLowStock) return -1;
      if (!aHasLowStock && bHasLowStock) return 1;
      
      // If both have same priority, maintain original order
      return 0;
    });
  }

  private updateDisplayedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = this.allMedicines.slice(startIndex, endIndex);
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    
    if (filterValue.trim() === '') {
      // If no filter, show all original data (already sorted)
      this.allMedicines = [...this.originalMedicines];
    } else {
      // Filter the original data and maintain Low Stock priority
      const filteredData = this.originalMedicines.filter(medicine =>
        medicine.genericName.toLowerCase().includes(filterValue.trim().toLowerCase())
      );
      this.allMedicines = this.sortMedicinesByPriority(filteredData);
    }
    
    this.totalItems = this.allMedicines.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1; // Reset to first page when filtering
    this.updateDisplayedData();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateDisplayedData();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.updateDisplayedData();
  }

  getStatusBadges(status: string): Array<{text: string, bgColor: string, textColor: string}> {
    const badges: Array<{text: string, bgColor: string, textColor: string}> = [];
    
    if (!status) return badges;
    
    const statusLower = status.toLowerCase();
    
    // Check for In Stock
    if (statusLower.includes('in stock')) {
      badges.push({
        text: 'In Stock',
        bgColor: '#DCFCE7',
        textColor: '#37A35C'
      });
    }
    
    // Check for Low Stock
    if (statusLower.includes('low stock')) {
      badges.push({
        text: 'Low Stock',
        bgColor: '#FFFEE2',
        textColor: '#FF9C11'
      });
    }
    
    // Check for expiry soon
    if (statusLower.includes('expiry soon')) {
      badges.push({
        text: 'Near Exp',
        bgColor: '#FFD5D6',
        textColor: '#A73412'
      });
    }
    
    return badges;
  }

  hasLowStock(status: string): boolean {
    if (!status) return false;
    return status.toLowerCase().includes('low stock');
  }

  refillMedicine(row: any): void {
    this.refillingMedicineId = row.id;
    this.refillQuantity = 0;
  }

  cancelRefill(): void {
    this.refillingMedicineId = null;
    this.refillQuantity = 0;
  }

  saveRefill(row: any): void {
    if (this.refillQuantity <= 0) {
      Swal.fire({
        title: 'Invalid Quantity',
        text: 'Please enter a valid refill quantity greater than 0.',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }

    // Call the API to refill the medicine
    this.medicineService.refillMedicine(row.id, this.refillQuantity).subscribe({
      next: (response) => {
        // Log audit after successful refill
        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'refilled medicine', 
              `${row.genericName} (${this.refillQuantity} units)`
            );
            
            this.auditService.postAudit(auditData).subscribe({
              next: () => console.log('Audit logged successfully'),
              error: (error) => console.error('Failed to log audit:', error)
            });
          }
        });

        Swal.fire({
          title: 'Refilled!',
          text: `"${row.genericName}" has been refilled with ${this.refillQuantity} units successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        // Reset refill state
        this.cancelRefill();
        
        // Refresh the medicines list to update the stock
        this.loadMedicines();
      },
      error: (error) => {
        console.error('Error refilling medicine:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to refill the medicine. Please try again later.',
          icon: 'error'
        });
      }
    });
  }

  isRefilling(medicineId: number): boolean {
    return this.refillingMedicineId === medicineId;
  }




  openAddMedicineDialog(): void {
    const dialogRef = this.dialog.open(MedicineAddModalComponent, {
      width: '631px',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      restoreFocus: false,
      panelClass: 'medicine-add-dialog'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Supplier added:', result);
        this.loadMedicines();
      }
    });
  }

  editMedicine(row: any): void {
    const dialogRef = this.dialog.open(MedicineEditModalComponent, {
      width: '600px',
      disableClose: false,
      data: row // Pass the medicine data to the modal
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMedicines(); // Refresh the table
      }
    });
  }

  deleteMedicine(row: any): void {
    const dialogRef = this.dialog.open(MedicineDeleteModalComponent, {
      width: '571px',
      height: '351px',
      disableClose: false,
      data: { medicineName: row.genericName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.medicineService.deleteMedicine(row.id).subscribe({
          next: () => {
            // Log audit after successful medicine deletion
            this.accountService.user$.pipe(take(1)).subscribe(user => {
              if (user) {
                const auditData = this.auditService.createAuditData(
                  user.firstName, 
                  'deleted medicine', 
                  row.genericName
                );
                
                this.auditService.postAudit(auditData).subscribe({
                  next: () => console.log('Audit logged successfully'),
                  error: (error) => console.error('Failed to log audit:', error)
                });
              }
            });

            Swal.fire({
              title: 'Deleted!',
              text: 'The medicine has been deleted successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadMedicines(); // Refresh the table
          },
          error: (error) => {
            console.error('Error deleting medicine:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete the medicine. Please try again later.',
              icon: 'error'
            });
          }
        });
      }
    });
  }
}
