import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryAddService } from './category-add.service';
import { MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrls: ['./category-add.component.scss']
})
export class CategoryAddComponent implements OnInit {
  category!: FormGroup;

  constructor(private fb: FormBuilder, 
    private categoryAddService: CategoryAddService,  
    public dialogRef: MatDialogRef<CategoryAddComponent>) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.category = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  onSubmit(): void {
    if (this.category.invalid) {
      this.category.markAllAsTouched();
      return;
    }

    const categoryData = { categoryName: this.category.value.categoryName };

    this.categoryAddService.createCategory(categoryData).subscribe(
      (response) => {
        Swal.fire({
          title: 'Success!',
          text: 'Category added successfully.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.dialogRef.close(response);
        });

        console.log('Category added successfully:', response);
      },
      (error) => {
        Swal.fire('Error!', error.error, 'error');
        console.error('Error adding Category:', error);
      }
    );
  }
}
