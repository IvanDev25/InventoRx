import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PatientAddService } from '../patient-add-modal/patient-add-modal.service';
import { AccountService } from '../account/account.service';
import { AuditService } from '../audit-log/audit-log.service';
import { take } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-edit-modal',
  templateUrl: './patient-edit-modal.component.html',
  styleUrls: ['./patient-edit-modal.component.scss']
})
export class PatientEditModalComponent {
  medicines: any[] = [];
  filteredMedicines: any[] = [];
  selectedMedicines: any[] = [];
  searchTerm: string = '';
  originalAssignedMedicines: any[] = []; // Track original assignments for comparison
  originalPatientName: string = ''; // Track original patient name for audit
  originalIsAdmitted: boolean = false; // Track original admission status for audit

  // ✅ Model for form data (allowing null for safety)
  patientData = {
    patientName: '',
    patientId: 0,
    isAdmitted: false,
    medicines: [] as any[]
  };

  constructor(
    private dialogRef: MatDialogRef<PatientEditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private patientAddService: PatientAddService,
    private cdr: ChangeDetectorRef,
    private accountService: AccountService,
    private auditService: AuditService
  ) {
    // Initialize with the passed data
    this.patientData.patientName = data.patientName;
    this.patientData.patientId = data.patientId;
    this.patientData.isAdmitted = data.isAdmitted || false;
    this.originalPatientName = data.patientName; // Store original name for audit
    this.originalIsAdmitted = data.isAdmitted || false; // Store original admission status for audit
  }

  ngOnInit(): void {
    this.loadMedicines();
  }

  // ✅ Load medicine list
  loadMedicines(): void {
    this.patientAddService.getMedicines().subscribe({
      next: (medicines) => {
        this.medicines = medicines.map(medicine => ({
          ...medicine,
          selected: false
        }));
        this.filteredMedicines = [...this.medicines];
        this.cdr.detectChanges();
        
        // Load assigned medicines after medicines are loaded
        this.loadAssignedMedicines();
      },
      error: (error) => {
        console.error('Error loading medicines:', error);
        Swal.fire('Error', 'Failed to load medicines.', 'error');
      }
    });
  }

  loadAssignedMedicines(): void {
    this.patientAddService.getAssignedMedicines(this.patientData.patientId).subscribe({
      next: (medicines) => {
        console.log('Loaded assigned medicines for patient:', this.patientData.patientId, medicines);
        this.originalAssignedMedicines = [...medicines]; // Store original for comparison
        // Mark assigned medicines as selected
        this.selectedMedicines = [...medicines];
        this.updateMedicineSelection();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading assigned medicines:', error);
        Swal.fire('Error', 'Failed to load assigned medicines.', 'error');
      }
    });
  }

  updateMedicineSelection(): void {
    // Update the selected state of medicines in the main list
    this.medicines.forEach(medicine => {
      medicine.selected = this.selectedMedicines.some(selected => selected.id === medicine.id);
    });
    this.filteredMedicines = [...this.medicines];
    console.log('Updated medicine selection:', this.selectedMedicines.length, 'selected medicines');
  }

  onSearchInputChange(): void {
    if (!this.searchTerm.trim()) {
      this.filteredMedicines = [...this.medicines];
      return;
    }

    this.filteredMedicines = this.medicines.filter(medicine =>
      medicine.genericName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  displayFn(medicine: any): string {
    if (!medicine) return '';
    // If it's a string (from input), return as is
    if (typeof medicine === 'string') return medicine;
    // If it's a medicine object, return the name
    return medicine.genericName || '';
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
    
    if (medicine.selected) {
      // Add to selected medicines if not already present
      if (!this.selectedMedicines.some(selected => selected.id === medicine.id)) {
        this.selectedMedicines.push(medicine);
      }
    } else {
      // Remove from selected medicines
      this.selectedMedicines = this.selectedMedicines.filter(selected => selected.id !== medicine.id);
    }
    
    this.cdr.detectChanges();
  }

  removeMedicine(medicine: any): void {
    this.selectedMedicines = this.selectedMedicines.filter(selected => selected.id !== medicine.id);
    
    // Update the medicine selection state
    const medicineInList = this.medicines.find(m => m.id === medicine.id);
    if (medicineInList) {
      medicineInList.selected = false;
    }
    
    // Update filtered medicines
    const filteredMedicine = this.filteredMedicines.find(m => m.id === medicine.id);
    if (filteredMedicine) {
      filteredMedicine.selected = false;
    }
    
    this.cdr.detectChanges();
  }

  // ✅ Submit form
  onUpdate() {
    if (!this.selectedMedicines || this.selectedMedicines.length === 0) {
      Swal.fire('Error', 'Please select at least one medicine.', 'error');
      return;
    }

    // Check if patient data was changed
    const patientNameChanged = this.originalPatientName !== this.patientData.patientName;
    const admissionStatusChanged = this.originalIsAdmitted !== this.patientData.isAdmitted;

    // If patient data changed, update it first
    if (patientNameChanged || admissionStatusChanged) {
      this.updatePatientData();
    } else {
      // If only medicines changed, proceed with medicine update
      this.updateMedicines();
    }
  }

  private updatePatientData(): void {
    const updateData = {
      patientName: this.patientData.patientName,
      isAdmitted: this.patientData.isAdmitted
    };

    this.patientAddService.updatePatient(this.patientData.patientId, updateData).subscribe({
      next: (response: any) => {
        // Log audit for patient data change
        this.logPatientDataChange();
        
        // After patient name update, update medicines
        this.updateMedicines();
      },
      error: (error: any) => {
        console.error('Error updating patient name:', error);
        Swal.fire('Error', 'Failed to update patient name.', 'error');
      }
    });
  }

  private updateMedicines(): void {
    // Get the current assigned medicine IDs
    const currentMedicineIds = this.originalAssignedMedicines.map(medicine => medicine.id);
    
    // Get the newly selected medicine IDs
    const newMedicineIds = this.selectedMedicines.map(medicine => medicine.id);
    
    // Find medicines to remove (in current but not in new)
    const medicinesToRemove = currentMedicineIds.filter(id => !newMedicineIds.includes(id));
    
    // Find medicines to add (in new but not in current)
    const medicinesToAdd = newMedicineIds.filter(id => !currentMedicineIds.includes(id));
    
    // If no changes, just return
    if (medicinesToRemove.length === 0 && medicinesToAdd.length === 0) {
      Swal.fire('Info', 'No medicine changes detected.', 'info');
      return;
    }
    
    // Process removals first, then additions
    this.processMedicineChanges(medicinesToRemove, medicinesToAdd);
  }

  private processMedicineChanges(medicinesToRemove: number[], medicinesToAdd: number[]): void {
    let completedOperations = 0;
    const totalOperations = (medicinesToRemove.length > 0 ? 1 : 0) + (medicinesToAdd.length > 0 ? 1 : 0);
    let hasError = false;
    
    const checkCompletion = () => {
      completedOperations++;
      if (completedOperations >= totalOperations) {
        if (!hasError) {
          // Log specific audit messages for added/removed medicines
          this.logMedicineChanges();
          Swal.fire('Success', 'Patient medicine assignments updated successfully!', 'success');
          this.dialogRef.close(true);
        }
      }
    };
    
    // Remove medicines first
    if (medicinesToRemove.length > 0) {
      this.patientAddService.removeMedicinesFromPatient(this.patientData.patientId, medicinesToRemove).subscribe({
        next: (response) => {
          console.log('Medicines removed successfully:', response);
          checkCompletion();
        },
        error: (error) => {
          console.error('Error removing medicines:', error);
          hasError = true;
          Swal.fire('Error', 'Failed to remove some medicines.', 'error');
          checkCompletion();
        }
      });
    }
    
    // Add medicines
    if (medicinesToAdd.length > 0) {
      this.patientAddService.assignMedicinesToPatient(this.patientData.patientId, medicinesToAdd).subscribe({
        next: (response) => {
          console.log('Medicines assigned successfully:', response);
          checkCompletion();
        },
        error: (error) => {
          console.error('Error assigning medicines:', error);
          hasError = true;
          Swal.fire('Error', 'Failed to assign some medicines.', 'error');
          checkCompletion();
        }
      });
    }
  }

  private logPatientDataChange(): void {
    this.accountService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        const auditData = this.auditService.createAuditData(
          user.firstName, 
          'updated patient data', 
          `Name: "${this.originalPatientName}" → "${this.patientData.patientName}", Admission: ${this.originalIsAdmitted} → ${this.patientData.isAdmitted}`
        );
        
        this.auditService.postAudit(auditData).subscribe({
          next: () => console.log('Audit logged successfully for patient data change'),
          error: (error) => console.error('Failed to log audit for patient data change:', error)
        });
      }
    });
  }

  onClose() {
    this.dialogRef.close();
  }

  private logMedicineChanges(): void {
    this.accountService.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        // Find added medicines (in selectedMedicines but not in originalAssignedMedicines)
        const addedMedicines = this.selectedMedicines.filter(selected => 
          !this.originalAssignedMedicines.some(original => original.id === selected.id)
        );

        // Find removed medicines (in originalAssignedMedicines but not in selectedMedicines)
        const removedMedicines = this.originalAssignedMedicines.filter(original => 
          !this.selectedMedicines.some(selected => selected.id === original.id)
        );

        // Log audit for added medicines
        if (addedMedicines.length > 0) {
          const addedNames = addedMedicines.map(med => med.genericName).join(', ');
          const auditData = this.auditService.createAuditData(
            user.firstName, 
            'added', 
            `${addedNames} to patient ${this.patientData.patientName}`
          );
          
          this.auditService.postAudit(auditData).subscribe({
            next: () => {},
            error: (error) => console.error('Failed to log audit for added medicines:', error)
          });
        }

        // Log audit for removed medicines
        if (removedMedicines.length > 0) {
          const removedNames = removedMedicines.map(med => med.genericName).join(', ');
          const auditData = this.auditService.createAuditData(
            user.firstName, 
            'removed', 
            `${removedNames} from patient ${this.patientData.patientName}`
          );
          
          this.auditService.postAudit(auditData).subscribe({
            next: () => {},
            error: (error) => console.error('Failed to log audit for removed medicines:', error)
          });
        }
      }
    });
  }

}
