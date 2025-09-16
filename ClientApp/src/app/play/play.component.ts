import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PlayService } from './play.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['fullName', 'email', 'playerManagement', 'adminManagement', 'managerManagement', 'categoryManagement', 'teamManagement'];

  

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(
    private playService: PlayService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAdminPermissions();
  }

  loadAdminPermissions(): void {
    this.playService.getAdminPermission().subscribe({
      next: (data: any[]) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.cdr.detectChanges(); // ensure view updates
      },
      error: (err) => {
        console.error('Failed to load admin permissions', err);
      }
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
