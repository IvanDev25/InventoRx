import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ReceiptData {
  patient: any;
  medicines: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptViewService {
  private isVisible$ = new BehaviorSubject<boolean>(false);
  private receiptData$ = new BehaviorSubject<ReceiptData | null>(null);

  showReceipt(data: ReceiptData): void {
    this.receiptData$.next(data);
    this.isVisible$.next(true);
  }

  hideReceipt(): void {
    this.isVisible$.next(false);
  }

  getVisibility(): Observable<boolean> {
    return this.isVisible$.asObservable();
  }

  getReceiptData(): Observable<ReceiptData | null> {
    return this.receiptData$.asObservable();
  }
}
