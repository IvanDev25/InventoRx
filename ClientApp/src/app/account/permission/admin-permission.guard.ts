import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { AccountService } from '../account.service';
import { NavbarService } from 'src/app/sidenvbar/sidenvbar.service';

export interface AdminPermission {
  id: number;
  userId: string;
  playerManagement: boolean;
  adminManagement: boolean;
  managerManagement: boolean;
  categoryManagement: boolean;
  teamManagement: boolean;
  accessEndDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminPermissionGuard implements CanActivate {

  constructor(
    private accountService: AccountService,
    private navbarService: NavbarService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const requiredPermission = route.data['permission'] as keyof AdminPermission;

    return this.accountService.user$.pipe(
      switchMap(user => {
        if (!user || !user.id) {
          this.router.navigate(['/account/login']);
          return of(false);
        }
        return this.navbarService.getAdminPermission(user.id).pipe(
          map((permission: AdminPermission) => {
            if (permission[requiredPermission]) {
              return true;
            } else {
              this.router.navigate(['/not-authorized']);
              return false;
            }
          }),
          catchError(() => {
            this.router.navigate(['/not-authorized']);
            return of(false);
          })
        );
      })
    );
  }
}
