import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-noification',
  templateUrl: './noification.component.html',
  styleUrls: ['./noification.component.scss']
})
export class NoificationComponent {
  isSuccess: boolean = true;
  title: string = '';
  message: string ='';

constructor (public bsModalRef: BsModalRef) 
{
  
}
}
