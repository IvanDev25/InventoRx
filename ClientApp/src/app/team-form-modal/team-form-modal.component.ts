import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TeamFormService } from './team-form-modal.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-team-form-modal',
  templateUrl: './team-form-modal.component.html',
  styleUrls: ['./team-form-modal.component.scss']
})
export class TeamFormModalComponent implements OnInit {

  category: any;
  managerForm!: FormGroup;
  playerForm!: FormGroup;

  displayedColumns: string[] = ['name', 'age', 'phoneNumber', 'actions'];
  dataSource: any[] = [];

  constructor(
    private teamFormService: TeamFormService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loadCategory();
    this.initManagerForm();
    this.initPlayerForm();
    this.updateDataSource();
  }

  loadCategory(): void {
    this.teamFormService.getCategory().subscribe(
      (data) => {
        this.category = data;
        console.log("category", data);
      },
      (error) => {
        console.error('Error fetching category:', error);
      }
    );
  }

  initManagerForm(): void {
    this.managerForm = this.fb.group({
      teamName: ['', Validators.required],
      categoryId: [null, Validators.required],
      name: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      players: this.fb.array([])  // Players array as FormArray
    });
  }

  initPlayerForm(): void {
    this.playerForm = this.fb.group({
      name: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(0)]],
      phoneNumber: ['', Validators.required]
    });
  }

  get players(): FormArray {
    return this.managerForm.get('players') as FormArray;
  }

  addPlayer(): void {
    if (this.playerForm.valid) {
      this.players.push(this.fb.group({
        name: this.playerForm.value.name,
        age: this.playerForm.value.age,
        phoneNumber: this.playerForm.value.phoneNumber
      }));
      this.playerForm.reset();
      this.updateDataSource();
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Player Data',
        text: 'Please fill all player fields correctly before adding.',
        confirmButtonColor: '#f6c343'
      });
    }
  }

  removePlayer(index: number): void {
    this.players.removeAt(index);
    this.updateDataSource();
  }

  updateDataSource(): void {
    this.dataSource = this.players.controls.map(control => control.value);
    this.cdr.detectChanges();
  }

  submitManager(): void {
    if (this.managerForm.valid) {
      Swal.fire({
        title: 'Submitting...',
        text: 'Please wait while we create the team.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      const managerData = {
        name: this.managerForm.value.name,
        age: this.managerForm.value.age,
        phoneNumber: this.managerForm.value.phoneNumber,
        email: this.managerForm.value.email
      };
  
      // Step 1: Create the manager
      this.teamFormService.createManager(managerData).subscribe({
        next: (response: any) => {
          const managerId = response.data;
  
          // Step 2: Create players with the managerId
          const playerData = this.players.value.map((player: any) => ({
            ...player,
            managerId: managerId
          }));
  
          this.teamFormService.createPlayers(playerData).subscribe({
            next: () => {
              // Step 3: Create the team after player creation
              const teamData = {
                teamName: this.managerForm.value.teamName,
                managerId: managerId,
                categoryId: this.managerForm.value.categoryId
              };
  
              this.teamFormService.createTeam(teamData).subscribe({
                next: () => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Manager, Players, and Team created successfully! An email has been sent to the manager.',
                    confirmButtonColor: '#3085d6'
                  }).then(() => {
                    this.managerForm.reset();
                    this.players.clear();
                    this.playerForm.reset();
                    this.updateDataSource();
                    this.dialog.closeAll();
                  });
                },
                error: (err) => {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to create the team.',
                    confirmButtonColor: '#d33'
                  });
                  console.error('Error creating team:', err);
                }
              });
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to create players.',
                confirmButtonColor: '#d33'
              });
              console.error('Error creating players:', err);
            }
          });
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Manager creation failed.',
            confirmButtonColor: '#d33'
          });
          console.error('Error creating manager:', err);
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please fill all required fields correctly.',
        confirmButtonColor: '#f6c343'
      });
    }
  }  
}
