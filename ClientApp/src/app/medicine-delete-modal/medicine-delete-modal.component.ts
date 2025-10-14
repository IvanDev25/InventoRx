import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-medicine-delete-modal',
  templateUrl: './medicine-delete-modal.component.html',
  styleUrls: ['./medicine-delete-modal.component.scss']
})
export class MedicineDeleteModalComponent {

  constructor(
    private dialogRef: MatDialogRef<MedicineDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { medicineName: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}









