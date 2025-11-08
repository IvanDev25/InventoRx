import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReceiptViewService } from './receipt-view.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-receipt-view',
  templateUrl: './receipt-view.component.html',
  styleUrls: ['./receipt-view.component.scss']
})
export class ReceiptViewComponent implements OnInit, OnDestroy {
  patientData: any;
  patientMedicines: any[] = [];
  acsMedicines: any[] = [];
  regularMedicines: any[] = [];
  currentDate: string = '';
  isVisible: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private receiptViewService: ReceiptViewService
  ) {}

  ngOnInit(): void {
    // Subscribe to visibility changes
    const visibilitySub = this.receiptViewService.getVisibility().subscribe(isVisible => {
      this.isVisible = isVisible;
    });
    this.subscriptions.add(visibilitySub);

    // Subscribe to data changes
    const dataSub = this.receiptViewService.getReceiptData().subscribe(data => {
      if (data) {
    this.patientData = data.patient;
    this.patientMedicines = data.medicines || [];
        this.processData();
      }
    });
    this.subscriptions.add(dataSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  processData(): void {
    // Format date as M/D/YYYY
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    this.currentDate = `${month}/${day}/${year}`;

    // Reset arrays
    this.acsMedicines = [];
    this.regularMedicines = [];

    // Group medicines by supplier type
    this.patientMedicines.forEach(medicine => {
      const supplierName = medicine.supplierName || '';
      if (supplierName === 'REGULAR') {
        this.regularMedicines.push(medicine);
      } else {
        this.acsMedicines.push(medicine);
      }
    });
  }

  onClose(): void {
    this.receiptViewService.hideReceipt();
  }

  onPrint(): void {
    window.print();
  }

  onBackdropClick(event: MouseEvent): void {
    // Close if clicking on backdrop (not the modal content)
    if ((event.target as HTMLElement).classList.contains('receipt-modal-overlay')) {
      this.onClose();
    }
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  getStatusText(): string {
    if (this.patientData?.isAdmitted) {
      return 'ADMITTED';
    }
    return 'OPD';
  }

  getEmptyRows(currentCount: number, maxRows: number): number[] {
    const emptyCount = Math.max(0, maxRows - currentCount);
    return Array(emptyCount).fill(0).map((_, i) => i);
  }
}
