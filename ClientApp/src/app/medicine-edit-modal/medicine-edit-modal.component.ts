import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MedicineAddService } from '../medicine-add-modal/medicine-add-modal.service';
import { MedicineAddSupplierModalComponent } from '../medicine-add-supplier-modal/medicine-add-supplier-modal.component';
import { AccountService } from '../account/account.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { AuditService } from '../audit-log/audit-log.service';

@Component({
  selector: 'app-medicine-edit-modal',
  templateUrl: './medicine-edit-modal.component.html',
  styleUrls: ['./medicine-edit-modal.component.scss']
})
export class MedicineEditModalComponent implements OnInit {
  suppliers: any[] = [];
  selectedSupplierId: number | null = null;
  originalData: any = {}; // Store original data for comparison

  // Model for form data
  medicineData = {
    id: 0,
    genericName: '',
    price: 0,
    stock: 0,
    expirationDate: '',
    medicineSupplierId: 0 as number | null
  };

  constructor(
    private dialogRef: MatDialogRef<MedicineEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private medicineAddService: MedicineAddService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private auditService: AuditService
  ) {
    // Store original data for comparison
    this.originalData = { ...data };
    
    // Initialize with the passed medicine data
    if (data) {
      this.medicineData = {
        id: data.id,
        genericName: data.genericName || '',
        price: data.price || 0,
        stock: data.stock || 0,
        expirationDate: this.formatDateForInput(data.expirationDate) || '',
        medicineSupplierId: data.medicineSupplierId || null
      };
      this.selectedSupplierId = data.medicineSupplierId;
    }
  }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  // Format date from API (ISO format) to HTML date input format (YYYY-MM-DD)
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    
    try {
      // Handle ISO format like "2026-10-05T00:00:00"
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  // Load supplier list
  loadSuppliers() {
    this.medicineAddService.getMedicineSuppliers().subscribe({
      next: (response) => {
        this.suppliers = response;
        
        // If no supplier is selected, select the first one
        if (!this.selectedSupplierId && this.suppliers.length > 0) {
          this.selectedSupplierId = this.suppliers[0].id;
          this.medicineData.medicineSupplierId = this.selectedSupplierId;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading suppliers:', error);
      }
    });
  }

  // Opens Add Supplier modal
  openAddSupplierDialog(): void {
    const dialogRef = this.dialog.open(MedicineAddSupplierModalComponent, {
      width: '400px',
      disableClose: false,
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadSuppliers();
      }
    });
  }

  // Submit form
  onUpdate() {
    if (!this.medicineData.genericName || !this.medicineData.expirationDate) {
      Swal.fire('Error', 'Please fill out all required fields.', 'error');
      return;
    }

    // Ensure supplierId is valid
    this.medicineData.medicineSupplierId = this.selectedSupplierId ?? 0;

    // Create update data without stock field (keep stock as is)
    const updateData = {
      id: this.medicineData.id,
      genericName: this.medicineData.genericName,
      price: this.medicineData.price,
      expirationDate: this.medicineData.expirationDate,
      medicineSupplierId: this.medicineData.medicineSupplierId
      // Note: stock is intentionally excluded to keep existing value
    };

    this.medicineAddService.updateMedicine(updateData).subscribe({
      next: (response) => {
        // Log specific audit messages for changed fields
        this.logSpecificChanges();
        
        Swal.fire('Success', 'Medicine updated successfully!', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error updating medicine:', error);
        Swal.fire('Error', 'Failed to update medicine.', 'error');
      }
    });
  }

  private logSpecificChanges(): void {
    this.accountService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        const changes: string[] = [];
        
        // Check for changes in each field
        if (this.originalData.genericName !== this.medicineData.genericName) {
          changes.push(`name from "${this.originalData.genericName}" to "${this.medicineData.genericName}"`);
        }
        
        if (this.originalData.price !== this.medicineData.price) {
          changes.push(`price from ${this.originalData.price} to ${this.medicineData.price}`);
        }
        
        if (this.formatDateForInput(this.originalData.expirationDate) !== this.medicineData.expirationDate) {
          const originalDate = this.formatDateForInput(this.originalData.expirationDate);
          changes.push(`expiration date from "${originalDate}" to "${this.medicineData.expirationDate}"`);
        }
        
        if (this.originalData.medicineSupplierId !== this.medicineData.medicineSupplierId) {
          // Get supplier names from the original data if available, otherwise use IDs
          const originalSupplier = this.getSupplierName(this.originalData.medicineSupplierId);
          const newSupplier = this.getSupplierName(this.medicineData.medicineSupplierId);
          changes.push(`supplier from "${originalSupplier}" to "${newSupplier}"`);
        }
        
        // Log audit for each change
        if (changes.length > 0) {
          changes.forEach(change => {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'changed medicine', 
              `${this.medicineData.genericName} (${change})`
            );
            
            this.auditService.postAudit(auditData).subscribe({
              next: () => {},
              error: (error) => console.error('Failed to log audit:', error)
            });
          });
        } else {
          // If no changes detected, log a general view message
          const auditData = this.auditService.createAuditData(
            user.firstName, 
            'viewed medicine details', 
            this.medicineData.genericName
          );
          
          this.auditService.postAudit(auditData).subscribe({
            next: () => {},
            error: (error) => console.error('Failed to log audit:', error)
          });
        }
      }
    });
  }

  private getSupplierName(supplierId: number | null): string {
    if (!supplierId) return 'No Supplier';
    
    // First try to find in the loaded suppliers list
    const supplier = this.suppliers.find(s => s.id === supplierId);
    if (supplier) {
      return supplier.supplierName;
    }
    
    // If not found in suppliers list, check if it's in the original data
    if (this.originalData.medicineSupplier && this.originalData.medicineSupplier.id === supplierId) {
      return this.originalData.medicineSupplier.supplierName;
    }
    
    // If still not found, return the ID as fallback
    return `Supplier ID: ${supplierId}`;
  }

  onClose() {
    this.dialogRef.close();
  }
}
