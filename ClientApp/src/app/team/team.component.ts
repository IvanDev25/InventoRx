import { Component, OnInit, ViewChild } from '@angular/core';
import { TeamService } from './team.service';
import { MatDialog } from '@angular/material/dialog';
import { TeamDetailModalComponent } from '../team-detail-modal/team-detail-modal.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent implements OnInit {
  displayedColumns: string[] = ['id', 'teamName', 'categoryName', 'managerName', 'status', 'action'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private teamService: TeamService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamService.getTeams().subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error fetching teams:', error);
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  viewTeam(id: number): void {
    this.teamService.getTeamById(id).subscribe(data => {
      this.dialog.open(TeamDetailModalComponent, {
        width: '400px',
        data: data
      });
    });
  }

  editTeam(id: number): void {
    // Handle edit
    console.log('Edit team with ID:', id);
  }

  deleteTeam(id: number): void {
    // Handle delete
    console.log('Delete team with ID:', id);
  }
}
