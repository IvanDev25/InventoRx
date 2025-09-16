import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AccountService } from '../account/account.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  hideNavbar: boolean = false;
  activeDropdown: 'language' | 'user' | null = null;

  flag = '🇺🇸';
  language = 'Eng (US)';
  constructor(
    public accountService: AccountService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;

        // Hide navbar if on login/register/send-email/reset-password routes
        const hideOnRoutes = [
          '/account/login',
          '/account/register',
          '/account/confirm-email',
          '/account/send-email',
          '/account/reset-password'
        ];

        // Check if user is not logged in and on root path
        this.accountService.user$.subscribe(user => {
           console.log('User from accountService.user$:', user);
          this.hideNavbar =
            hideOnRoutes.includes(url) || (url === '/' && !user);
        });
      });
  }

  logout() {
    this.accountService.logout();
  }

  toggleDropdown(type: 'language' | 'user') {
    if (this.activeDropdown === type) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = type;
    }
  }

  selectLanguage(flag: string, language: string) {
    this.flag = flag;
    this.language = language;
    this.activeDropdown = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector') && !target.closest('.user-profile')) {
      this.activeDropdown = null;
    }
  }
}
