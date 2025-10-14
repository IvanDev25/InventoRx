import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { SharedModule } from './shared/shared.module';
import { PlayComponent } from './play/play.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { SidenvbarComponent } from './sidenvbar/sidenvbar.component';
import { TeamComponent } from './team/team.component';
import { TeamDetailModalComponent } from './team-detail-modal/team-detail-modal.component';
import { ManagerComponent } from './manager/manager.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryComponent } from './category/category.component';
import { CategoryDeleteComponent } from './category-delete/category-delete.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';
import { CategoryAddComponent } from './category-add/category-add.component';
import { PlayerComponent } from './player/player.component';
import { PlayerDeleteComponent } from './player-delete/player-delete.component';
import { TeamFormModalComponent } from './team-form-modal/team-form-modal.component';
import { MedicineComponent } from './medicine/medicine.component';
import { MedicineAddSupplierModalComponent } from './medicine-add-supplier-modal/medicine-add-supplier-modal.component';
import { MedicineAddModalComponent } from './medicine-add-modal/medicine-add-modal.component';
import { MedicineEditModalComponent } from './medicine-edit-modal/medicine-edit-modal.component';
import { MedicineDeleteModalComponent } from './medicine-delete-modal/medicine-delete-modal.component';
import { AuditLogComponent } from './audit-log/audit-log.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientComponent } from './patient/patient.component';
import { PatientAddModalComponent } from './patient-add-modal/patient-add-modal.component';
import { PatientEditModalComponent } from './patient-edit-modal/patient-edit-modal.component';
import { PatientDeleteModalComponent } from './patient-delete-modal/patient-delete-modal.component';
import { PatientDischargeModalComponent } from './patient-discharge-modal/patient-discharge-modal.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    PlayComponent,
    SidenvbarComponent,
    TeamComponent,
    TeamDetailModalComponent,
    ManagerComponent,
    CategoryComponent,
    CategoryDeleteComponent,
    CategoryEditComponent,
    CategoryAddComponent,
    PlayerComponent,
    PlayerDeleteComponent,
    TeamFormModalComponent,
    MedicineComponent,
    MedicineAddSupplierModalComponent,
    MedicineAddModalComponent,
    MedicineEditModalComponent,
    MedicineDeleteModalComponent,
    AuditLogComponent,
    DashboardComponent,
    PatientComponent,
    PatientAddModalComponent,
    PatientEditModalComponent,
    PatientDeleteModalComponent,
    PatientDischargeModalComponent,
    ToastContainerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
