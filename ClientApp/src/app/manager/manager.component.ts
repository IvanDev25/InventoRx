import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ManagerService } from './manager.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.scss']
})
export class ManagerComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'age', 'phoneNumber', 'email', 'action'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private managerService: ManagerService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadManager();

  }

  loadManager(): void {
    this.managerService.getManagers().subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        console.log("managers",data);
      },
      (error) => {
        console.error('Error fetching managers:', error);
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
