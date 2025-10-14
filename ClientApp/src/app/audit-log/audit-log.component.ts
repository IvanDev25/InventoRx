import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuditService } from './audit-log.service';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.scss']
})
export class AuditLogComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'createdToday'];
  dataSource = new MatTableDataSource<any>();
  auditLogs: any[] = [];
  filteredAuditLogs: any[] = [];
  paginatedData: any[] = [];
  searchTerm: string = '';

  // Pagination properties
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private auditService: AuditService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadAuditLogs(): void {
    this.auditService.getAllAudits().subscribe({
      next: (response) => {
        this.auditLogs = response;
        this.filteredAuditLogs = response;
        this.dataSource.data = this.auditLogs;
        
        // Update pagination values
        this.updatePagination();
        
        // Update paginated data
        this.updatePaginatedData();
        
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
      }
    });
  }

  updatePagination(): void {
    this.totalItems = this.filteredAuditLogs.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1; // Reset to first page when data changes
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredAuditLogs.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedData();
    console.log('Page changed to:', page);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm = filterValue.trim().toLowerCase();
    
    if (!this.searchTerm) {
      // If search is empty, show all audit logs
      this.filteredAuditLogs = this.auditLogs;
    } else {
      // Filter audit logs based on search term
      this.filteredAuditLogs = this.auditLogs.filter(audit => 
        audit.name.toLowerCase().includes(this.searchTerm) ||
        audit.description.toLowerCase().includes(this.searchTerm) ||
        audit.createdToday.toString().toLowerCase().includes(this.searchTerm)
      );
    }
    
    // Update pagination and paginated data
    this.updatePagination();
    this.updatePaginatedData();
    
    this.cdr.detectChanges();
  }
}
