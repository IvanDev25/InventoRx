import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { NoificationComponent } from './components/modals/noification/noification.component';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
BsModalRef?: BsModalRef;

  constructor(private modalService: BsModalService) { }

  showNotification(isSuccess: boolean, title: string, message: string) {
    const initialState: ModalOptions = {
      initialState: {
        isSuccess,
        title,
        message
      }
    };
    this.BsModalRef = this.modalService.show(NoificationComponent, initialState);
  }
  }
