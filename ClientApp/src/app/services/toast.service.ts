import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastCounter = 0;

  constructor() {}

  showSuccess(message: string, duration: number = 3000): void {
    this.addToast({
      id: `toast-${++this.toastCounter}`,
      message,
      type: 'success',
      duration
    });
  }

  showError(message: string, duration: number = 3000): void {
    this.addToast({
      id: `toast-${++this.toastCounter}`,
      message,
      type: 'error',
      duration
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.addToast({
      id: `toast-${++this.toastCounter}`,
      message,
      type: 'info',
      duration
    });
  }

  showWarning(message: string, duration: number = 3000): void {
    this.addToast({
      id: `toast-${++this.toastCounter}`,
      message,
      type: 'warning',
      duration
    });
  }

  private addToast(toast: ToastMessage): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove toast after duration
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
    }
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }
}
