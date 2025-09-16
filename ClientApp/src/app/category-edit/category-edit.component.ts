import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CategoryEditService } from './category-edit.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrls: ['./category-edit.component.scss']
})
export class CategoryEditComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<CategoryEditComponent>,
    @Inject(MAT_DIALOG_DATA) public category: any,
    private categoryEditService: CategoryEditService
  ) {}

  ngOnInit(): void {
    console.log('Incoming data:', this.category);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.category.categoryName.trim()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Category name cannot be empty.',
        icon: 'warning'
      });
      return;
    }
  
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save the changes to this category?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
  
        console.log('Updating category:', this.category);
  
        this.categoryEditService.updateCategory(this.category).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Category updated successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.dialogRef.close('edited');
          },
          error: (err) => {
            Swal.fire({
              title: 'Error!',
              text: 'Failed to update category.',
              icon: 'error'
            });
            console.error('Update error:', err);
          }
        });
      }
    });
  }
  
}
