import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { sideNavData } from './sidemenu-data';
import { filter, switchMap, tap, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AccountService } from '../account/account.service';
import { NavbarService } from './sidenvbar.service';

@Component({
  selector: 'app-sidenvbar',
  templateUrl: './sidenvbar.component.html',
  styleUrls: ['./sidenvbar.component.scss']
})
export class SidenvbarComponent implements OnInit, OnDestroy {

  collapsed = false;
  navData = sideNavData;           // Full nav items
  filteredNavData = sideNavData;   // Filtered nav items based on permissions
  expandedItem: any = null;
  hideNavbar: boolean = false;
  adminPermission: any;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private router: Router,
    public accountService: AccountService,
    private navbarService: NavbarService
  ) { }

  ngOnInit(): void {
    // Load permissions and filter nav items on navigation end and user change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap(() => this.accountService.user$),
      filter((user): user is NonNullable<typeof user> => user !== null && !!user.id),
      switchMap(user => this.navbarService.getAdminPermission(user.id)),
      tap(permission => {
        this.adminPermission = permission;
        this.filterNavItems();
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe();

    // Hide navbar on certain routes or if user is not logged in on root
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      switchMap(() => this.accountService.user$),
      // **Removed filter(user !== null) here to handle null user**
      tap(user => {
        const url = this.router.url;
        const hideOnRoutes = [
          '/account/login',
          '/account/register',
          '/account/confirm-email',
          '/account/send-email',
          '/account/reset-password'
        ];
        this.hideNavbar = hideOnRoutes.includes(url) || (url === '/' && !user);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe();
  }

  filterNavItems() {
    if (!this.adminPermission) {
      this.filteredNavData = [];
      return;
    }

    this.filteredNavData = this.navData.filter(navItem => {
      // Use 'permissionKey' to map nav item to permission, if present
      const key = navItem.permissionKey;
      return key ? this.adminPermission[key] === true : true;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    if (this.collapsed) {
      this.expandedItem = null;
    }
  }

  toggleOpen(): void {
    this.collapsed = false;
  }

  toggleSubMenu(nav: any): void {
    if (this.collapsed && nav.subItem) {
      this.collapsed = false;
    }
    this.expandedItem = this.expandedItem === nav ? null : nav;
  }
}
