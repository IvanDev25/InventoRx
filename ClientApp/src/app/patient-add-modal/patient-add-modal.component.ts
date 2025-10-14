import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PatientAddService } from './patient-add-modal.service';
import { AccountService } from '../account/account.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';
import { AuditService } from '../audit-log/audit-log.service';

@Component({
  selector: 'app-patient-add-modal',
  templateUrl: './patient-add-modal.component.html',
  styleUrls: ['./patient-add-modal.component.scss']
})
export class PatientAddModalComponent {
  medicines: any[] = [];
  filteredMedicines: any[] = [];
  selectedMedicines: any[] = [];
  searchTerm: string = '';

  // ✅ Model for form data (allowing null for safety)
  patientData = {
    patientName: '',
    isAdmitted: false,
    medicines: [] as any[]
  };

  constructor(
    private dialogRef: MatDialogRef<PatientAddModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private patientAddService: PatientAddService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private auditService: AuditService
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  // ✅ Load medicine list
  loadMedicines(): void {
    this.patientAddService.getMedicines().subscribe({
      next: (data) => {
        this.medicines = data.map(medicine => ({
          ...medicine,
          selected: false
        }));
        this.filteredMedicines = [...this.medicines];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading medicines:', error);
      }
    });
  }

  displayFn(medicine: any): string {
    if (!medicine) return '';
    // If it's a string (from input), return as is
    if (typeof medicine === 'string') return medicine;
    // If it's a medicine object, return the name
    return medicine.genericName || '';
  }

  onSearchInputChange(): void {
    this.filterMedicines();
    this.cdr.detectChanges();
  }

  filterMedicines(): void {
    if (!this.searchTerm.trim()) {
      // Show all medicines, with selected ones first
      this.filteredMedicines = [...this.medicines].sort((a, b) => {
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        return 0;
      });
    } else {
      // Filter medicines by search term
      const filtered = this.medicines.filter(medicine =>
        medicine.genericName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      
      // Sort filtered results: selected medicines first, then alphabetically
      this.filteredMedicines = filtered.sort((a, b) => {
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        return a.genericName.localeCompare(b.genericName);
      });
    }
  }

  onOptionSelected(event: any): void {
    // Prevent the autocomplete from closing by keeping the input focused
    setTimeout(() => {
      const input = document.querySelector('input[name="medicineSearch"]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  toggleMedicineSelection(medicine: any): void {
    medicine.selected = !medicine.selected;
    this.updateSelectedMedicines();
    // Refresh the filtered list to maintain proper order
    this.filterMedicines();
    this.cdr.detectChanges();
  }

  updateSelectedMedicines(): void {
    this.selectedMedicines = this.medicines.filter(medicine => medicine.selected);
  }

  removeMedicine(medicine: any): void {
    medicine.selected = false;
    this.updateSelectedMedicines();
    // Refresh the filtered list to maintain proper order
    this.filterMedicines();
    this.cdr.detectChanges();
  }

  // ✅ Submit form
  onAdd() {
    if (!this.patientData.patientName) {
      Swal.fire('Error', 'Please fill out all required fields.', 'error');
      return;
    }

    if (!this.selectedMedicines || this.selectedMedicines.length === 0) {
      Swal.fire('Error', 'Please select at least one medicine.', 'error');
      return;
    }

    // Step 1: Create the patient
    const patientData = {
      patientName: this.patientData.patientName,
      isAdmitted: this.patientData.isAdmitted
    };

    this.patientAddService.postPatient(patientData).subscribe({
      next: (response) => {
        // Log audit after successful patient creation
        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'added patient', 
              this.patientData.patientName
            );
            
            this.auditService.postAudit(auditData).subscribe({
              next: () => {},
              error: (error) => console.error('Failed to log audit for patient creation:', error)
            });
          }
        });
        
        // Since API returns only text "Patient added successfully.", 
        // we need to get the latest patient to find the ID
        this.getLatestPatientAndAssignMedicines();
      },
      error: (error) => {
        console.error('Error creating patient:', error);
        Swal.fire('Error', 'Failed to add patient.', 'error');
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  private getLatestPatientAndAssignMedicines(): void {
    this.patientAddService.getLatestPatient().subscribe({
      next: (patients) => {
        if (patients && patients.length > 0) {
          // Find the patient with the matching name (most recent)
          const latestPatient = patients.find((patient: any) => 
            patient.patientName === this.patientData.patientName
          );
          
          if (latestPatient) {
            this.assignMedicinesToPatient(latestPatient.id);
          } else {
            console.error('Could not find patient with name:', this.patientData.patientName);
            Swal.fire('Error', 'Patient created but could not find patient ID. Please try again.', 'error');
          }
        } else {
          console.error('No patients found');
          Swal.fire('Error', 'Patient created but could not retrieve patient list. Please try again.', 'error');
        }
      },
      error: (error) => {
        console.error('Error getting patients:', error);
        Swal.fire('Error', 'Patient created but could not retrieve patient list. Please try again.', 'error');
      }
    });
  }

  private assignMedicinesToPatient(patientId: number): void {
    // Extract just the medicine IDs as an array
    const medicineIds = this.selectedMedicines.map(medicine => medicine.id);

    this.patientAddService.assignMedicinesToPatient(patientId, medicineIds).subscribe({
      next: (response) => {
        // Log audit after successful medicine assignment
        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const medicineNames = this.selectedMedicines.map(med => med.genericName).join(', ');
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'assigned medicines to patient', 
              `${this.patientData.patientName} (${medicineNames})`
            );
            
            this.auditService.postAudit(auditData).subscribe({
              next: () => {},
              error: (error) => console.error('Failed to log audit for medicine assignment:', error)
            });
          }
        });
        
        Swal.fire('Success', 'Patient and medicines added successfully!', 'success');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error assigning medicines:', error);
        Swal.fire('Error', 'Failed to assign medicines to patient.', 'error');
      }
    });
  }

  resetForm(): void {
    this.patientData.patientName = '';
    this.patientData.isAdmitted = false;
    this.selectedMedicines = [];
  }

}
