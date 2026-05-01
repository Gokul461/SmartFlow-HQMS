import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { HospitalService } from '../../../core/services/hospital.service';
import { User, RoleCounts, Department, CreateStaffRequest } from '../../../core/models';

@Component({
  selector: 'app-admin-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-staff.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminStaffComponent implements OnInit {
  private userService = inject(UserService);
  private hospitalService = inject(HospitalService);
  private cdr = inject(ChangeDetectorRef);

  staff: User[] = [];
  roleCounts: RoleCounts = {};
  departments: Department[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filterRole = '';

  showModal = false;
  modalLoading = false;
  modalError = '';
  form: CreateStaffRequest = { name: '', email: '', password: '', phone: '', role: 'DOCTOR', departmentId: 0 };

  ngOnInit() {
    this.loadRoleCounts();
    this.loadStaff();
    this.loadDepartments();
  }

  loadRoleCounts() {
    this.userService.getStaffRoleCounts().subscribe({
      next: (res) => {
        if (res.success) this.roleCounts = res.data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadStaff() {
    this.loading = true;
    this.error = '';
    this.userService.getStaff(this.filterRole || undefined, this.searchTerm || undefined).pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.staff = res.data ?? [];
        if (!res.success) this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load staff.';
        this.cdr.markForCheck();
      }
    });
  }

  loadDepartments() {
    this.hospitalService.getAdminDepartments().subscribe({
      next: (res) => {
        if (res.success) this.departments = res.data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  openModal() {
    this.form = { name: '', email: '', password: '', phone: '', role: 'DOCTOR', departmentId: 0 };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalError = '';
  }

  onRoleChange() {
    if (this.form.role === 'ADMIN') this.form.departmentId = 0;
  }

  createStaff() {
    if (!this.form.name || !this.form.email || !this.form.password || !this.form.role) {
      this.modalError = 'Please fill in all required fields.';
      return;
    }
    if (this.form.role !== 'ADMIN' && !this.form.departmentId) {
      this.modalError = 'Please select a department.';
      return;
    }
    this.modalLoading = true;
    this.modalError = '';
    this.userService.createStaff(this.form).subscribe({
      next: (res) => {
        this.modalLoading = false;
        if (res.success) {
          this.closeModal();
          this.loadStaff();
          this.loadRoleCounts();
        } else {
          this.modalError = res.message;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.modalLoading = false;
        this.modalError = err.error?.message || 'Failed to create staff member.';
        this.cdr.markForCheck();
      }
    });
  }

  activate(id: number) {
    this.userService.activateStaff(id).subscribe({
      next: () => { this.loadStaff(); this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  deactivate(id: number) {
    this.userService.deactivateStaff(id).subscribe({
      next: () => { this.loadStaff(); this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  canDeactivate(user: User): boolean {
    if (user.role === 'ADMIN') return false;
    return true;
  }

  getCount(role: string): number {
    return (this.roleCounts as any)[role] || 0;
  }
}
