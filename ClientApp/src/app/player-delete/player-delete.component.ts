import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PlayersDeleteService } from './player-delete.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-player-delete',
  templateUrl: './player-delete.component.html',
  styleUrls: ['./player-delete.component.scss']
})
export class PlayerDeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PlayerDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, name: string },
    private playersDeleteService: PlayersDeleteService
  ) {}

  ngOnInit(): void {
    console.log("data", this.data);
  }

  
  onDelete(): void {
    this.playersDeleteService.deletePlayers(this.data.id).subscribe(
      () => {
        Swal.fire({
          title: 'Success',
          text: 'Players successfully deleted!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.dialogRef.close('deleted');
      },
      (error: any) => {
        console.error('Error deleting Players:', error);
        Swal.fire('Error!', 'There was a problem deleting the Players.', 'error');
        this.dialogRef.close();
      }
    );
  };
  
  onCancel(): void {
    this.dialogRef.close();
  }
}
