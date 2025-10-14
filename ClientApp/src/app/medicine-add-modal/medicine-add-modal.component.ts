import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MedicineAddService } from './medicine-add-modal.service';
import { MedicineAddSupplierModalComponent } from '../medicine-add-supplier-modal/medicine-add-supplier-modal.component';
import { AccountService } from '../account/account.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { AuditService } from '../audit-log/audit-log.service';

@Component({
  selector: 'app-medicine-add-modal',
  templateUrl: './medicine-add-modal.component.html',
  styleUrls: ['./medicine-add-modal.component.scss']
})
export class MedicineAddModalComponent {
  suppliers: any[] = [];
  selectedSupplierId: number | null = null;

  // ✅ Model for form data (allowing null for safety)
  medicineData = {
    genericName: '',
    price: 0,
    stock: 0,
    expirationDate: '',
    medicineSupplierId: 0 as number | null
  };

  constructor(
    private dialogRef: MatDialogRef<MedicineAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private medicineAddService: MedicineAddService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  // ✅ Load supplier list and auto-select first
  loadSuppliers() {
    this.medicineAddService.getMedicineSuppliers().subscribe({
      next: (response) => {
        this.suppliers = response;
  
        if (this.suppliers.length > 0) {
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

  // ✅ Opens Add Supplier modal
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

  // ✅ Submit form
  onAdd() {
    if (!this.medicineData.genericName || !this.medicineData.expirationDate) {
      Swal.fire('Error', 'Please fill out all required fields.', 'error');
      return;
    }

    // Ensure supplierId is valid
    this.medicineData.medicineSupplierId = this.selectedSupplierId ?? 0;

    this.medicineAddService.postMedicine(this.medicineData).subscribe({
      next: (response) => {
        // Log audit after successful medicine addition
        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'added medicine', 
              this.medicineData.genericName
            );
            
            this.auditService.postAudit(auditData).subscribe({
              next: () => {},
              error: (error) => console.error('Failed to log audit:', error)
            });
          }
        });

        Swal.fire('Success', 'Medicine added successfully!', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error adding medicine:', error);
        Swal.fire('Error', 'Failed to add medicine.', 'error');
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }
}
