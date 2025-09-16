import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotFoundComponent } from './components/errors/not-found/not-found.component';
import { ValidationMessagesComponent } from './components/errors/validation-messages/validation-messages.component';
import { RouterModule } from '@angular/router';
import {MatRadioModule} from '@angular/material/radio';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatCardModule} from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule } from '@angular/common/http';
import { NoificationComponent } from './components/modals/noification/noification.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
@NgModule({
  declarations: [
    NotFoundComponent,
    ValidationMessagesComponent,
    NoificationComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    ModalModule.forRoot()
    
  ],
  exports: [
    RouterModule,
    MatCardModule,
    MatCheckboxModule,
    FormsModule,
    MatRadioModule,
    MatToolbarModule,
    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    ReactiveFormsModule,
    HttpClientModule,
    ValidationMessagesComponent,
    MatSelectModule,
    MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule,MatTooltipModule,MatDialogModule,CommonModule,MatDialogModule
  ]
})
export class SharedModule { }
