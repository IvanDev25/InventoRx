import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-patient-discharge-modal',
  templateUrl: './patient-discharge-modal.component.html',
  styleUrls: ['./patient-discharge-modal.component.scss']
})
export class PatientDischargeModalComponent {

  constructor(
    private dialogRef: MatDialogRef<PatientDischargeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patientName: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDischarge(): void {
    this.dialogRef.close(true);
  }
}


