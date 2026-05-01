import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-patients.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPatientsComponent implements OnInit {
  private userService = inject(UserService);
  private cdr         = inject(ChangeDetectorRef);

  patients: User[] = [];
  patientCount = 0;
  loading  = true;
  error    = '';
  search   = '';

  ngOnInit() {
    this.loadPatients();
    this.loadCount();
  }

  loadPatients() {
    this.loading = true;
    this.error   = '';
    this.userService.getPatients(this.search || undefined).pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        if (res.success) this.patients = res.data ?? [];
        else this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load patients.';
        this.cdr.markForCheck();
      }
    });
  }

  loadCount() {
    this.userService.getPatientCount().subscribe({
      next: (res) => {
        if (res.success) this.patientCount = res.data ?? 0;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  onSearch() {
    this.loadPatients();
  }

  clearSearch() {
    this.search = '';
    this.loadPatients();
  }

  getInitials(name: string): string {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }
}
