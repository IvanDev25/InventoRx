import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { PlayerService } from './player.service';
import { MatDialog } from '@angular/material/dialog';
import { PlayerDeleteComponent } from '../player-delete/player-delete.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

managers: any[] = [];
players: any[] = [];  // Store players associated with the selected manager
selectedManagerId: number | '' = '';  // Default to no selection, will be updated on load

displayedColumns: string[] = ['id', 'name', 'age', 'phoneNumber', 'action'];
dataSource = new MatTableDataSource<any>();

@ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private playerService: PlayerService, private dialog: MatDialog
    ,private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadManager();
  }

   loadManager(): void {
    this.playerService.getManagers().subscribe(
      (data) => {
        this.managers = data;
        if (this.managers.length > 0) {
          this.selectedManagerId = this.managers[0].id;
          this.onManagerChange();
        }
      },
      (error) => {
        console.error('Error fetching managers:', error);
      }
    );
  }

  onManagerChange(): void {
    if (this.selectedManagerId === '') {
      this.players = [];
    } else {
      this.playerService.getPlayersByManagerId(Number(this.selectedManagerId)).subscribe(
        (data) => {
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
        },
        (error) => {
          console.error('Error fetching players:', error);
        }
      );
    }
  }

  openDeletePlayerDialog(Id: number, name: string): void {
    const dialogRef = this.dialog.open(PlayerDeleteComponent, {
      data: { id: Id, name: name },
      panelClass: 'custom-dialog-container'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.loadManager();
        this.onManagerChange();
        this.cdr.detectChanges();
      }
    });
  }

}
