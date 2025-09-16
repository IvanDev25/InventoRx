import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-team-detail-modal',
  templateUrl: './team-detail-modal.component.html',
  styleUrls: ['./team-detail-modal.component.scss']
})
export class TeamDetailModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TeamDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public team: any
  ) {}


  ngOnInit(): void {
    console.log("team", this.team);
  }

  close(): void {
    this.dialogRef.close();
  }
}
