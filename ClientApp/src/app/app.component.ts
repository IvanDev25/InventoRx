import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthLoading = true;

  constructor(private accountService: AccountService) {
    
  }

  ngOnInit(): void {
    this.refreshUser();
  }

  private refreshUser() {
    const jwt = this.accountService.getJWT();
    if (jwt) {
      this.accountService.refreshUser(jwt).subscribe({
        next: _ => {
          this.isAuthLoading = false;
        },
        error: _ => {
          this.accountService.logout();
          this.isAuthLoading = false;
        }
      })
    } else {
      this.accountService.refreshUser(null).subscribe({
        next: _ => {
          this.isAuthLoading = false;
        }
      });
    }
  }
  title = 'Ivan Identity';
}
 