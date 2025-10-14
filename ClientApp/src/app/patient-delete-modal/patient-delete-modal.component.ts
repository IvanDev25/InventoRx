import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-patient-delete-modal',
  templateUrl: './patient-delete-modal.component.html',
  styleUrls: ['./patient-delete-modal.component.scss']
})
export class PatientDeleteModalComponent {

  constructor(
    private dialogRef: MatDialogRef<PatientDeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientName: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}


