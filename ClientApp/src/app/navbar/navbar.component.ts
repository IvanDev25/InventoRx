import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor (public accountService: AccountService) {
    
  }


  // ngOnInit(): void {
  //   throw new Error('Method not implemented.');
  // }

  logout() {
    this.accountService.logout();
  }
}
