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
import { CategoryComponent } from './category/category.component';
import { CategoryDeleteComponent } from './category-delete/category-delete.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';
import { CategoryAddComponent } from './category-add/category-add.component';
import { PlayerComponent } from './player/player.component';
import { PlayerDeleteComponent } from './player-delete/player-delete.component';
import { TeamFormModalComponent } from './team-form-modal/team-form-modal.component';

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    CommonModule

  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
