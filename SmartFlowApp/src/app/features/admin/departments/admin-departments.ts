import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HospitalService } from '../../../core/services/hospital.service';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-departments.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDepartmentsComponent implements OnInit {
  private hospitalService = inject(HospitalService);
  private cdr = inject(ChangeDetectorRef);

  departments: Department[] = [];
  loading = true;
  error = '';

  showModal = false;
  newDeptName = '';
  modalLoading = false;
  modalError = '';

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading = true;
    this.hospitalService.getAdminDepartments().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.departments = res.data;
        else this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load departments.';
        this.cdr.markForCheck();
      }
    });
  }

  openModal() {
    this.newDeptName = '';
    this.modalError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalError = '';
  }

  createDepartment() {
    if (!this.newDeptName.trim()) {
      this.modalError = 'Department name is required.';
      return;
    }
    this.modalLoading = true;
    this.modalError = '';
    this.hospitalService.createDepartment(this.newDeptName.trim()).subscribe({
      next: (res) => {
        this.modalLoading = false;
        if (res.success) {
          this.closeModal();
          this.loadDepartments();
        } else {
          this.modalError = res.message;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.modalLoading = false;
        this.modalError = err.error?.message || 'Failed to create department.';
        this.cdr.markForCheck();
      }
    });
  }
}
