import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { TeamService } from './team.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TeamDetailModalComponent } from '../team-detail-modal/team-detail-modal.component';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  displayedColumns: string[] = ['genericName', 'price', 'stock', 'expirationDate', 'status', 'action'];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private medicineService: TeamService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMedicines();
  }

  loadMedicines(): void {
    this.medicineService.getMedicine().subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Search should be case-insensitive
        this.dataSource.filterPredicate = (data: any, filter: string) =>
          data.genericName.toLowerCase().includes(filter.trim().toLowerCase());

        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching medicines:', error);
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editMedicine(row: any): void {
    console.log('Edit:', row);
    // open your edit modal here
  }

  deleteMedicine(row: any): void {
    console.log('Delete:', row);
    // add confirmation + delete logic here
  }
}
