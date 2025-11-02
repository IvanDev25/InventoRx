import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isAuthLoading = true;
  showChat = false;

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.refreshUser();
    // control chat visibility by route
    this.router.events.pipe(filter(ev => ev instanceof NavigationEnd)).subscribe(() => {
      const url = this.router.url.split('?')[0];
      const allow = ['/dashboard', '/medicine', '/patient', '/audit-log'];
      this.showChat = allow.includes(url.toLowerCase());
    });
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
 