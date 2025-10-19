import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PatientService } from './patient.service';
import { PatientAddModalComponent } from '../patient-add-modal/patient-add-modal.component';
import { PatientEditModalComponent } from '../patient-edit-modal/patient-edit-modal.component';
import { PatientDeleteModalComponent } from '../patient-delete-modal/patient-delete-modal.component';
import { PatientDischargeModalComponent } from '../patient-discharge-modal/patient-discharge-modal.component';
import { AccountService } from '../account/account.service';
import { AuditService } from '../audit-log/audit-log.service';
import { ToastService } from '../services/toast.service';
import { take } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent implements OnInit {

  patients: any[] = [];
  filteredPatients: any[] = []; // Store filtered patients separately
  flattenedData: any[] = [];
  paginatedData: any[] = [];
  displayedColumns: string[] = ['patientName', 'medicineName', 'supplierName', 'issuance', 'return', 'stock', 'quantity', 'price', 'priceTotal', 'patientTotal', 'action'];
  
  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  
  // Track recently modified patients with timestamps
  recentlyModifiedPatients: Map<number, number> = new Map();


  constructor(
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private accountService: AccountService,
    private auditService: AuditService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        // Sort patients by recently modified timestamp (most recent first)
        // Patients with recent modifications will be at the top
        const sortedData = data.sort((a, b) => {
          const aTime = this.recentlyModifiedPatients.get(a.id) || 0;
          const bTime = this.recentlyModifiedPatients.get(b.id) || 0;
          return bTime - aTime; // Most recent first
        });
        
        this.patients = sortedData;
        this.filteredPatients = sortedData; // Initially, no filter
        this.flattenedData = this.flattenPatientData(sortedData);
        
        // Update pagination values based on patients, not medicine rows
        this.totalItems = this.filteredPatients.length; // Count patients, not medicine rows
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.currentPage = 1; // Reset to first page when data changes
        
        // Update paginated data
        this.updatePaginatedData();
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.toastService.showError('Failed to load patient data. Please refresh the page.');
      }
    });
  }

  // Helper method to mark patient as recently modified and move to top
  private updatePatientLastModified(patientId: number): void {
    const currentTime = Date.now(); // Use timestamp for sorting
    
    // Mark as recently modified with current timestamp
    this.recentlyModifiedPatients.set(patientId, currentTime);
    
    // Re-sort the patients array
    this.patients.sort((a, b) => {
      const aTime = this.recentlyModifiedPatients.get(a.id) || 0;
      const bTime = this.recentlyModifiedPatients.get(b.id) || 0;
      return bTime - aTime; // Most recent first
    });
    
    // Update filtered patients and flattened data
    this.filteredPatients = [...this.patients];
    this.flattenedData = this.flattenPatientData(this.patients);
    this.updatePaginatedData();
  }

  flattenPatientData(patients: any[]): any[] {
    const flattened: any[] = [];
    
    patients.forEach(patient => {
      // Calculate totals for this patient - separate for REGULAR and non-REGULAR consigners
      let patientTotal = 0;
      let regularConsignerTotal = 0;
      let regularConsignerQuantity = 0;
      let nonRegularConsignerTotal = 0;
      let nonRegularConsignerQuantity = 0;
      
      patient.patientMedicines.forEach((patientMedicine: any, index: number) => {
        const quantity = patientMedicine.quantity || 0;
        const price = patientMedicine.medicine.price || 0;
        const priceTotal = quantity * price;
        const supplierName = patientMedicine.medicine.medicineSupplier?.supplierName || 'No Supplier';
        const isRegularConsigner = supplierName === 'REGULAR';
        
        // Add to patient total
        patientTotal += priceTotal;
        
        // Separate totals for REGULAR vs non-REGULAR consigners
        if (isRegularConsigner) {
          regularConsignerTotal += priceTotal;
          regularConsignerQuantity += quantity;
        } else {
          nonRegularConsignerTotal += priceTotal;
          nonRegularConsignerQuantity += quantity;
        }
        
        flattened.push({
          patientName: patient.patientName,
          patientId: patient.id, // Add patientId to the flattened data
          dateCreated: patient.dateCreated,
          isAdmitted: patient.isAdmitted,
          medicineName: patientMedicine.medicine.genericName,
          supplierName: supplierName,
          issuance: patientMedicine.medicine.issuance,
          return: patientMedicine.medicine.return,
          stock: patientMedicine.medicine.stock,
          quantity: quantity,
          price: price,
          priceTotal: priceTotal,
          patientTotal: patientTotal, // Add patient total to each row
          regularConsignerTotal: regularConsignerTotal,
          regularConsignerQuantity: regularConsignerQuantity,
          nonRegularConsignerTotal: nonRegularConsignerTotal,
          nonRegularConsignerQuantity: nonRegularConsignerQuantity,
          status: patientMedicine.medicine.status,
          isFirstMedicine: index === 0,
          rowspan: patient.patientMedicines.length,
          showReturnInput: false,
          originalData: patientMedicine
        });
      });
      
      // Update all rows for this patient with the final totals
      const patientRows = flattened.filter(row => row.patientName === patient.patientName);
      patientRows.forEach(row => {
        row.patientTotal = patientTotal;
        row.regularConsignerTotal = regularConsignerTotal;
        row.regularConsignerQuantity = regularConsignerQuantity;
        row.nonRegularConsignerTotal = nonRegularConsignerTotal;
        row.nonRegularConsignerQuantity = nonRegularConsignerQuantity;
      });
    });
    
    return flattened;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    
    if (filterValue.trim() === '') {
      // If no filter, show all original data
      this.filteredPatients = this.patients;
    } else {
      // Filter the patients first
      this.filteredPatients = this.patients.filter(patient =>
        patient.patientName.toLowerCase().includes(filterValue.trim().toLowerCase()) ||
        patient.patientMedicines.some((pm: any) => 
          pm.medicine.genericName.toLowerCase().includes(filterValue.trim().toLowerCase()) ||
          (pm.medicine.medicineSupplier?.supplierName || '').toLowerCase().includes(filterValue.trim().toLowerCase())
        )
      );
    }
    
    // Update flattened data based on filtered patients
    this.flattenedData = this.flattenPatientData(this.filteredPatients);
    
    // Update pagination based on filtered patients count
    this.totalItems = this.filteredPatients.length; // Count filtered patients, not medicine rows
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1; // Reset to first page when filtering
    this.updatePaginatedData();
  }

  // Issuance methods
  cancelIssuance(): void {
    // Reset issuance values to 0 for all rows
    this.flattenedData.forEach(row => {
      row.issuance = 0;
      row.originalData.medicine.issuance = 0;
    });
    this.cdr.detectChanges();
  }

  saveIssuance(row: any): void {
    if (!row.issuance || row.issuance <= 0) {
      this.toastService.showError('Please enter a valid issuance quantity greater than 0.');
      return;
    }

    const patientId = row.patientId;
    const medicineId = row.originalData.medicine.id;
    const quantityChange = row.issuance;
  
    this.patientService.updatePatientMedicineQuantity(patientId, medicineId, quantityChange, 'issuance').subscribe({
      next: (response) => {
        console.log('Patient medicine quantity updated successfully:', response);
        
        // Show success toast notification
        this.toastService.showSuccess('Medicine issued to patient successfully!');

        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'issued medicine to patient', 
              `${row.patientName} ${row.originalData.medicine.genericName} (${row.issuance} units)`
            );

            this.auditService.postAudit(auditData).subscribe({
              next: () => console.log('Audit logged successfully'),
              error: (error) => console.error('Failed to log audit:', error)
            });
          }
        });

        // Reset issuance input
        row.issuance = 0;
        
        // Mark patient as recently modified
        this.updatePatientLastModified(patientId);
        
        // Reload all patient data to get updated quantities and stock
        this.loadPatients();
      },
      error: (error) => {
        console.error('Error updating patient medicine quantity:', error);
        
        // Show error toast notification
        this.toastService.showError(error.error?.message || 'Failed to issue medicine to patient!');
      }
    });
  }

  // Return methods
  toggleReturnInput(row: any, checked: boolean): void {
    row.showReturnInput = checked;
    if (!checked) {
      // Reset return value to 0 when unchecked
      row.return = 0;
      row.originalData.medicine.return = 0;
    }
  }

  cancelReturn(row: any): void {
    // Hide the input and reset the return value
    row.showReturnInput = false;
    row.return = 0;
    row.originalData.medicine.return = 0;
    this.cdr.detectChanges();
  }

  saveReturn(row: any): void {
    if (!row.return || row.return < 0) {
      this.toastService.showError('Please enter a valid return quantity (0 or greater).');
      return;
    }

    const patientId = row.patientId;
    const medicineId = row.originalData.medicine.id;
    const quantityChange = row.return;
  
    this.patientService.updatePatientMedicineQuantity(patientId, medicineId, quantityChange, 'return').subscribe({
      next: (response) => {
        console.log('Patient medicine quantity updated successfully:', response);
        
        // Show success toast notification
        this.toastService.showSuccess('Medicine returned from patient successfully!');

        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'returned medicine from patient', 
              `${row.patientName} ${row.originalData.medicine.genericName} (${row.return} units)`
            );

            this.auditService.postAudit(auditData).subscribe({
              next: () => console.log('Audit logged successfully'),
              error: (error) => console.error('Failed to log audit:', error)
            });
          }
        });

        // Reset return input and hide the input
        row.return = 0;
        row.showReturnInput = false;
        
        // Mark patient as recently modified
        this.updatePatientLastModified(patientId);
        
        // Reload all patient data to get updated quantities and stock
        this.loadPatients();
      },
      error: (error) => {
        console.error('Error updating patient medicine quantity:', error);
        
        // Show error toast notification
        this.toastService.showError(error.error?.message || 'Failed to return medicine from patient!');
      }
    });
  }

  // Legacy methods (keeping for backward compatibility if needed elsewhere)
  updateIssuance(row: any, value: string): void {
    const numValue = parseInt(value, 10) || 0;
    row.issuance = numValue;
    row.originalData.medicine.issuance = numValue;
  }

  isIssuanceButtonDisabled(row: any): boolean {
    // Button is disabled when issuance is 0, empty, or null
    // Button is enabled when issuance is 1 or above
    return !row.issuance || row.issuance === 0;
  }

  updateReturn(row: any, value: string): void {
    const numValue = parseInt(value, 10) || 0;
    row.return = numValue;
    row.originalData.medicine.return = numValue;
  }

  editPatientMedicines(row: any): void {
    // Create patient data object with all necessary information
    const patientData = {
      patientName: row.patientName,
      patientId: row.patientId,
      dateCreated: row.dateCreated,
      isAdmitted: row.isAdmitted,
      originalData: row.originalData
    };
    
    const dialogRef = this.dialog.open(PatientEditModalComponent, {
      width: '600px',
      disableClose: false,
      data: patientData // Pass the patient data to the modal
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Patient medicine assignments updated:', result);
        
        // Update patient lastModified timestamp and move to top
        this.updatePatientLastModified(patientData.patientId);
        
        // Reload all patient data to show updated medicine assignments
        this.loadPatients();
      }
    });
  }

  deletePatient(row: any): void {
    const dialogRef = this.dialog.open(PatientDeleteModalComponent, {
      width: '571px',
      height: '351px',
      disableClose: false,
      data: { patientName: row.patientName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.deletePatient(row.originalData.patientId).subscribe({
          next: () => {
            // Log audit after successful patient deletion
            this.accountService.user$.pipe(take(1)).subscribe(user => {
              if (user) {
                const auditData = this.auditService.createAuditData(
                  user.firstName, 
                  'deleted patient', 
                  row.patientName
                );
                
                this.auditService.postAudit(auditData).subscribe({
                  next: () => console.log('Audit logged successfully'),
                  error: (error) => console.error('Failed to log audit:', error)
                });
              }
            });

            this.toastService.showSuccess('Patient deleted successfully!');
            this.loadPatients(); // Refresh the table
          },
          error: (error) => {
            console.error('Error deleting patient:', error);
            this.toastService.showError('Failed to delete patient. Please try again later.');
          }
        });
      }
    });
  }

  dischargePatient(row: any): void {
    const dialogRef = this.dialog.open(PatientDischargeModalComponent, {
      width: '600px',
      height: '400px',
      disableClose: false,
      data: { patientName: row.patientName }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.deletePatient(row.originalData.patientId).subscribe({
          next: () => {
            // Log audit after successful patient discharge (deletion)
            this.accountService.user$.pipe(take(1)).subscribe(user => {
              if (user) {
                const auditData = this.auditService.createAuditData(
                  user.firstName, 
                  'discharged patient', 
                  row.patientName
                );
                
                this.auditService.postAudit(auditData).subscribe({
                  next: () => console.log('Audit logged successfully'),
                  error: (error) => console.error('Failed to log audit:', error)
                });
              }
            });

            this.toastService.showSuccess('Patient discharged successfully!');
            this.loadPatients(); // Refresh the table
          },
          error: (error) => {
            console.error('Error discharging patient:', error);
            this.toastService.showError('Failed to discharge patient. Please try again later.');
          }
        });
      }
    });
  }

  

  updateMedicineReturn(row: any): void {
    const medicineData = {
      id: row.originalData.medicine.id,
      genericName: row.originalData.medicine.genericName,
      issuance: row.originalData.medicine.issuance,
      price: row.originalData.medicine.price,
      stock: row.originalData.medicine.stock,
      expirationDate: row.originalData.medicine.expirationDate,
      return: row.return,
      medicineSupplierId: row.originalData.medicine.medicineSupplierId
    };
  
    this.patientService.updateMedicines([medicineData]).subscribe({
      next: (response) => {
        console.log('Return updated successfully:', response);
        
        // Show success toast notification
        this.toastService.showSuccess('Medicine return updated successfully!');

        this.accountService.user$.pipe(take(1)).subscribe(user => {
          if (user) {
            const auditData = this.auditService.createAuditData(
              user.firstName, 
              'return', 
              `${row.originalData.medicine.genericName} (${row.return} units)`
            );

            this.auditService.postAudit(auditData).subscribe({
              next: () => console.log('Audit logged successfully'),
              error: (error) => console.error('Failed to log audit:', error)
            });
          }
        });

        row.originalData.medicine.return = row.return;
        this.loadPatients();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating return:', error);
        
        // Show error toast notification
        this.toastService.showError('Failed to update medicine return!');
      }
    });
  }
  

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'in stock':
        return 'status-verified';
      case 'low stock':
        return 'status-pending';
      default:
        return 'status-pending';
    }
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

  openAddPatientModal(): void {
    const dialogRef = this.dialog.open(PatientAddModalComponent, {
      width: '600px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Patient added:', result);
        // Mark the new patient as recently modified
        if (result.patientId) {
          this.recentlyModifiedPatients.set(result.patientId, Date.now());
        }
        this.loadPatients();
      }
    });
  }

  closeAddPatientModal(): void {
    // This method is no longer needed with dialog approach
  }

  updatePaginatedData(): void {
    // Get the current patients for this page
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    // Get the patients for this page
    const patientsToShow = this.filteredPatients.slice(startIndex, endIndex);
    
    // Flatten only the patients for this page
    this.paginatedData = this.flattenPatientData(patientsToShow);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedData();
    console.log('Page changed to:', page);
  }

  downloadPatientPDF(row: any): void {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Get current date for the report
      const currentDate = new Date().toLocaleDateString();
      
      // Set up fonts and colors
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      
      // Add title
      doc.text('Patient Medicine Report', 20, 30);
      
      // Add patient information
      doc.setFontSize(14);
      doc.setTextColor(60, 60, 60);
      doc.text(`Patient Name: ${row.patientName}`, 20, 50);
      doc.text(`Report Date: ${currentDate}`, 20, 60);
      doc.text(`Status: ${row.isAdmitted ? 'Admitted' : 'Not Admitted'}`, 20, 70);
      
      // Add line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 80, 190, 80);
      
      // Get all medicines for this patient
      const patientMedicines = this.flattenedData.filter(item => item.patientId === row.patientId);
      
      if (patientMedicines.length > 0) {
        // Add table headers
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.setFont('helvetica', 'bold');
        
        let yPosition = 95;
        doc.text('Medicine Name', 20, yPosition);
        doc.text('Consignor', 70, yPosition);
        doc.text('Stock', 110, yPosition);
        doc.text('Qty', 130, yPosition);
        doc.text('Price', 150, yPosition);
        doc.text('Total', 170, yPosition);
        
        // Add line under headers
        doc.line(20, yPosition + 5, 190, yPosition + 5);
        
        // Add medicine data
        doc.setFont('helvetica', 'normal');
        yPosition = 110;
        
        patientMedicines.forEach((medicine, index) => {
          if (yPosition > 270) { // Check if we need a new page
            doc.addPage();
            yPosition = 30;
          }
          
          doc.text(medicine.medicineName, 20, yPosition);
          doc.text(medicine.supplierName, 70, yPosition);
          doc.text(medicine.stock.toString(), 110, yPosition);
          doc.text(medicine.quantity.toString(), 130, yPosition);
          doc.text(`₱${medicine.price.toFixed(2)}`, 150, yPosition);
          doc.text(`₱${medicine.priceTotal.toFixed(2)}`, 170, yPosition);
          
          yPosition += 10;
        });
        
        // Add totals section
        yPosition += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('TOTALS:', 20, yPosition);
        
        if (row.nonRegularConsignerTotal > 0) {
          yPosition += 10;
          doc.text(`Consignor Total: ₱${row.nonRegularConsignerTotal.toFixed(2)}`, 30, yPosition);
        }
        
        if (row.regularConsignerTotal > 0) {
          yPosition += 10;
          doc.text(`REGULAR Total: ₱${row.regularConsignerTotal.toFixed(2)}`, 30, yPosition);
        }
        
        yPosition += 10;
        doc.text(`Grand Total: ₱${row.patientTotal.toFixed(2)}`, 30, yPosition);
      } else {
        doc.setFontSize(12);
        doc.text('No medicines assigned to this patient.', 20, 95);
      }
      
      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by InventoRx System', 20, 285);
      
      // Save the PDF
      const fileName = `Patient_Report_${row.patientName.replace(/\s+/g, '_')}_${currentDate.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
      // Show success message
      this.toastService.showSuccess('Patient report downloaded successfully!');
      
      // Log audit
      this.accountService.user$.pipe(take(1)).subscribe(user => {
        if (user) {
          const auditData = this.auditService.createAuditData(
            user.firstName, 
            'downloaded patient PDF report', 
            row.patientName
          );
          
          this.auditService.postAudit(auditData).subscribe({
            next: () => console.log('Audit logged successfully'),
            error: (error) => console.error('Failed to log audit:', error)
          });
        }
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.toastService.showError('Failed to generate PDF report. Please try again.');
    }
  }

}
