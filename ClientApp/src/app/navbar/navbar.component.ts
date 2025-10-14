import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AccountService } from '../account/account.service';
import { MedicineService } from '../medicine/medicine.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  hideNavbar: boolean = false;
  activeDropdown: 'language' | 'user' | 'notification' | null = null;
  currentPageTitle: string = 'Dashboard';

  flag = '🇺🇸';
  language = 'Eng (US)';
  
  // Notification properties
  notifications: any[] = [];
  notificationCount: number = 0;

  constructor(
    public accountService: AccountService,
    private router: Router,
    private medicineService: MedicineService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;
        this.updatePageTitle(url);

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
          
          // Load notifications if user is logged in
          if (user && !this.hideNavbar) {
            this.loadNotifications();
          }
        });
      });
  }

  updatePageTitle(url: string): void {
    // Remove query parameters and fragments
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Map routes to page titles
    const routeTitles: { [key: string]: string } = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/medicine': 'Medicine',
      '/patient': 'Patient',
      '/audit-log': 'Audit Log',
      '/account/login': 'Login',
      '/account/register': 'Register',
      '/account/profile': 'Profile',
      '/account/settings': 'Settings'
    };

    // Get the title from the mapping or use the route segment
    this.currentPageTitle = routeTitles[cleanUrl] || this.getTitleFromRoute(cleanUrl);
  }

  private getTitleFromRoute(url: string): string {
    // Extract the last segment of the URL and capitalize it
    const segments = url.split('/').filter(segment => segment.length > 0);
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    }
    return 'Dashboard';
  }

  logout() {
    this.accountService.logout();
  }

  toggleDropdown(type: 'language' | 'user' | 'notification') {
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

  loadNotifications(): void {
    this.medicineService.getMedicine().subscribe(
      (medicines) => {
        this.notifications = [];
        
        medicines.forEach((medicine: any) => {
          const status = medicine.status?.toLowerCase() || '';
          const isLowStock = status.includes('low stock');
          const isExpiringSoon = status.includes('expiry soon');
          
          if (isLowStock) {
            this.notifications.push({
              type: 'low-stock',
              title: 'Low Stock Alert',
              message: `${medicine.genericName} is running low (${medicine.stock} units remaining)`,
              time: this.getTimeAgo(new Date()),
              medicineId: medicine.id
            });
          }
          
          if (isExpiringSoon) {
            const daysUntilExpiry = Math.ceil((new Date(medicine.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            this.notifications.push({
              type: 'expiry',
              title: 'Expiry Alert',
              message: `${medicine.genericName} expires in ${daysUntilExpiry} days`,
              time: this.getTimeAgo(new Date()),
              medicineId: medicine.id
            });
          }
        });
        
        this.notificationCount = this.notifications.length;
      },
      (error) => {
        console.error('Error loading notifications:', error);
      }
    );
  }

  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  // Method to refresh notifications (can be called from other components)
  refreshNotifications(): void {
    this.loadNotifications();
  }

  navigateToMedicine(): void {
    this.activeDropdown = null;
    this.router.navigate(['/Medicine']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-selector') && !target.closest('.user-section')) {
      this.activeDropdown = null;
    }
  }
}
