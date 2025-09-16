import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CategoryService } from './category.service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryDeleteComponent } from '../category-delete/category-delete.component';
import { CategoryEditComponent } from '../category-edit/category-edit.component';
import { CategoryAddComponent } from '../category-add/category-add.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit  {
  displayedColumns: string[] = ['id', 'categoryName','action'];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private categoryService: CategoryService, private dialog: MatDialog, private cdr: ChangeDetectorRef,) { }

  ngOnInit(): void {
    this.loadCategory();

  }

  loadCategory(): void {
    this.categoryService.getCategory().subscribe(
      (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        console.log("category",data);
      },
      (error) => {
        console.error('Error fetching category:', error);
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDeleteCategoryDialog(Id: number, categoryName: string): void {
    const dialogRef = this.dialog.open(CategoryDeleteComponent, {
      data: { id: Id, name: categoryName },
      panelClass: 'custom-dialog-container'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.loadCategory();
        this.cdr.detectChanges();
      }
    });
  }

  openEditCategoryDialog(id: number): void {
    this.categoryService.getCategoryById(id).subscribe(
      (data) => {
        const dialogRef = this.dialog.open(CategoryEditComponent, {
          panelClass: 'custom-dialog-container',
          data: data
        });
  
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'edited') {
            this.loadCategory();
            this.cdr.detectChanges();
          }
        });
      },
      (error) => {
        console.error(`Error fetching category with ID ${id}:`, error);
        Swal.fire({
          title: 'Error',
          text: `Category with ID ${id} not found.`,
          icon: 'error'
        });
      }
    );
  }
  

  openAddCategoryDialog(): void {
    const dialogRef = this.dialog.open(CategoryAddComponent, {
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategory();
        this.cdr.detectChanges();
      }
    });
  }
  
  
}
