import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PlayComponent } from './play/play.component';
import { NotFoundComponent } from './shared/components/errors/not-found/not-found.component';
import { AuthorizationGuard } from './shared/guards/authorization.guard';
import { TeamComponent } from './team/team.component';
import { ManagerComponent } from './manager/manager.component';
import { CategoryComponent } from './category/category.component';
import { PlayerComponent } from './player/player.component';
import { AdminPermissionGuard } from './account/permission/admin-permission.guard';
import { MedicineComponent } from './medicine/medicine.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientComponent } from './patient/patient.component';

const routes: Routes = [
  { path: '', redirectTo: '/account/login', pathMatch: 'full' },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthorizationGuard],
    children: [
      { 
        path: 'Admin', 
        component: PlayComponent, 
        canActivate: [AdminPermissionGuard], 
        data: { permission: 'adminManagement' } 
      },
      { 
        path: 'Team', 
        component: TeamComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'teamManagement' }
      },
      { 
        path: 'Medicine', 
        component: MedicineComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'teamManagement' }
      },
      { 
        path: 'Patient', 
        component: PatientComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'teamManagement' }
      },
      { 
        path: 'AuditLog', 
        component: AuditLogComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'teamManagement' }
      },
      { 
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'teamManagement' }
      },
      { 
        path: 'Manager', 
        component: ManagerComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'managerManagement' }
      },
      { 
        path: 'Category', 
        component: CategoryComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'categoryManagement' }
      },
      { 
        path: 'Player', 
        component: PlayerComponent, 
        canActivate: [AdminPermissionGuard],
        data: { permission: 'playerManagement' }
      },
    ]
  },
  { path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
