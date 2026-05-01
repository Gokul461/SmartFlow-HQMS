import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';

@Component({
  selector: 'app-patient-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-book.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientBookComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  doctorId: number = 0;
  doctorName = '';
  departmentId: number = 0;
  departmentName = '';
  hospitalId: number = 0;
  hospitalName = '';

  scheduledDate = '';
  minDate = '';

  slots: string[] = [];
  selectedSlot = '';
  loadingSlots = false;
  slotsError = '';

  loading = false;
  error = '';
  successMessage = '';
  confirmedToken: number | null = null;
  confirmedTime = '';

  ngOnInit() {
    const state = window.history.state;
    if (state) {
      this.doctorId      = state.doctorId      || 0;
      this.doctorName    = state.doctorName    || '';
      this.departmentId  = state.departmentId  || 0;
      this.departmentName = state.departmentName || '';
      this.hospitalId    = state.hospitalId    || 0;
      this.hospitalName  = state.hospitalName  || '';
    }

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    this.minDate = `${y}-${m}-${d}`;
    this.scheduledDate = this.minDate;
    this.loadSlots();
  }

  onDateChange() {
    this.selectedSlot = '';
    this.slots = [];
    this.slotsError = '';
    this.loadSlots();
  }

  loadSlots() {
    if (!this.doctorId || !this.scheduledDate) return;

    this.loadingSlots = true;
    this.slotsError = '';
    this.appointmentService.getAvailableSlots(this.doctorId, this.scheduledDate).subscribe({
      next: (res) => {
        this.loadingSlots = false;
        if (res.success) {
          this.slots = res.data || [];
          if (this.slots.length === 0) {
            this.slotsError = 'No slots available on this date. Please choose another day.';
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadingSlots = false;
        this.slotsError = 'Could not load slots. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }

  get amSlots(): string[] {
    return this.slots.filter(s => parseInt(s.split(':')[0]) < 12);
  }

  get pmSlots(): string[] {
    return this.slots.filter(s => parseInt(s.split(':')[0]) >= 13);
  }

  /** Format "09:15:00" → "9:15 AM" */
  formatSlot(slot: string): string {
    const [h, m] = slot.split(':').map(Number);
    const period = h < 12 ? 'AM' : 'PM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  }

  confirmBooking() {
    if (!this.scheduledDate) { this.error = 'Please select a date.'; return; }
    if (!this.selectedSlot)  { this.error = 'Please select a time slot.'; return; }
    if (!this.doctorId || !this.departmentId || !this.hospitalId) {
      this.error = 'Missing booking info. Please go back and try again.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.appointmentService.bookAppointment(
      this.doctorId,
      this.departmentId,
      this.hospitalId,
      this.scheduledDate,
      this.selectedSlot
    ).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.confirmedToken = res.data?.token?.tokenNumber ?? null;
          this.confirmedTime  = this.formatSlot(this.selectedSlot);
          this.successMessage = 'Appointment confirmed!';
          setTimeout(() => this.router.navigate(['/patient/appointments']), 3000);
        } else {
          this.error = res.message;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to book appointment.';
        this.cdr.markForCheck();
      }
    });
  }
}
