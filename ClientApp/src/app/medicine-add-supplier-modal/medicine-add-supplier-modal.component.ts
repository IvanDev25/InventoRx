import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { MedicineSupplierService } from './medicine-add-supplier-modal.service';
import { AccountService } from '../account/account.service';
import { take } from 'rxjs';
import { AuditService } from '../audit-log/audit-log.service';

@Component({
  selector: 'app-medicine-add-supplier-modal',
  templateUrl: './medicine-add-supplier-modal.component.html',
  styleUrls: ['./medicine-add-supplier-modal.component.scss']
})
export class MedicineAddSupplierModalComponent {
  supplierForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MedicineAddSupplierModalComponent>,
    private supplierService: MedicineSupplierService,
    private accountService: AccountService,
    private auditService: AuditService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.supplierForm = this.fb.group({
      supplierName: [data?.supplierName || '', Validators.required]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.supplierForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing information',
        text: 'Please enter supplier name.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    this.isLoading = true;
    const supplierData = this.supplierForm.value;

    this.supplierService.postMedicineSupplier(supplierData).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Log audit after successful supplier addition
        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'added medicine supplier', 
              supplierData.supplierName
            );
            
            this.auditService.postAudit(auditData).subscribe({
              next: () => console.log('Audit logged successfully'),
              error: (error) => console.error('Failed to log audit:', error)
            });
          }
        });

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response?.data || 'Supplier added successfully!',
          confirmButtonColor: '#28a745',
          timer: 2000,
          showConfirmButton: false
        });

        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;

        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error.error?.error || 'Failed to add supplier.',
          confirmButtonColor: '#dc3545'
        });

        console.error('Error saving supplier:', error);
      }
    });
  }
}
