import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { HospitalService } from '../../../core/services/hospital.service';
import { Hospital, CreateHospitalRequest } from '../../../core/models';

@Component({
  selector: 'app-sa-hospitals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sa-hospitals.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaHospitalsComponent implements OnInit {
  private hospitalService = inject(HospitalService);
  private cdr = inject(ChangeDetectorRef);

  hospitals: Hospital[] = [];
  loading = true;
  error = '';
  actionLoading = false;

  // Modal
  showModal = false;
  modalLoading = false;
  modalError = '';
  form: CreateHospitalRequest = {
    name: '', email: '', password: '', phone: '',
    hospitalName: '', hospitalCity: '', hospitalAddress: '', hospitalPhone: ''
  };

  // Confirm delete
  showConfirm = false;
  confirmId: number | null = null;
  confirmName = '';
  confirmError = '';

  ngOnInit() {
    this.loadHospitals();
  }

  loadHospitals() {
    this.loading = true;
    this.error = '';
    this.hospitalService.getAllHospitals().pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.hospitals = res.data ?? [];
        if (!res.success) this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load hospitals.';
        this.cdr.markForCheck();
      }
    });
  }

  openModal() {
    this.form = { name: '', email: '', password: '', phone: '', hospitalName: '', hospitalCity: '', hospitalAddress: '', hospitalPhone: '' };
    this.modalError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalError = '';
  }

  createHospital() {
    if (!this.form.name || !this.form.email || !this.form.password || !this.form.hospitalName || !this.form.hospitalCity) {
      this.modalError = 'Please fill in all required fields.';
      return;
    }
    this.modalLoading = true;
    this.modalError = '';
    this.hospitalService.createHospital(this.form).subscribe({
      next: (res) => {
        this.modalLoading = false;
        if (res.success) {
          this.closeModal();
          this.loadHospitals();
        } else {
          this.modalError = res.message;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.modalLoading = false;
        this.modalError = err.error?.message || 'Failed to create hospital.';
        this.cdr.markForCheck();
      }
    });
  }

  confirmDelete(hospital: Hospital) {
    this.confirmId = hospital.id;
    this.confirmName = hospital.name;
    this.confirmError = '';
    this.showConfirm = true;
  }

  cancelDelete() {
    this.showConfirm = false;
    this.confirmId = null;
    this.confirmError = '';
  }

  deleteHospital() {
    if (!this.confirmId) return;
    this.confirmError = '';
    this.hospitalService.deleteHospital(this.confirmId).subscribe({
      next: () => {
        this.showConfirm = false;
        this.confirmId = null;
        this.loadHospitals();
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.confirmError = err.error?.message || 'Failed to delete hospital.';
        this.cdr.markForCheck();
      }
    });
  }
}
