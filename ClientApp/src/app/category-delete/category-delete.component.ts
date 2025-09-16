import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryDeleteService } from './category-delete.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-delete',
  templateUrl: './category-delete.component.html',
  styleUrls: ['./category-delete.component.scss']
})
export class CategoryDeleteComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<CategoryDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, name: string },
    private categoryDeleteService: CategoryDeleteService
  ) {}

  ngOnInit(): void {
    console.log("data", this.data);
  }

  onDelete(): void {
    this.categoryDeleteService.deleteCategory(this.data.id).subscribe(
      () => {
        Swal.fire({
          title: 'Success',
          text: 'Category successfully deleted!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        this.dialogRef.close('deleted');
      },
      (error: any) => {
        console.error('Error deleting Category:', error);
        Swal.fire('Error!', 'There was a problem deleting the Category.', 'error');
        this.dialogRef.close();
      }
    );
  };
  
  onCancel(): void {
    this.dialogRef.close();
  }
}
