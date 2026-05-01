import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { Appointment } from '../../../core/models';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-appointments.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientAppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    this.appointmentService.getMyAppointments().pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.appointments = res.data ?? [];
        if (!res.success) this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load appointments.';
        this.cdr.markForCheck();
      }
    });
  }

  getTokenStatusMessage(appointment: Appointment): string {
    if (!appointment.token) return '';
    switch (appointment.token.status) {
      case 'WAITING': return `You're in queue — Token #${appointment.token.tokenNumber}`;
      case 'IN_PROGRESS': return 'Being seen now 🟢';
      case 'COMPLETED': return 'Consultation complete ✅';
      case 'CANCELLED': return 'Appointment cancelled';
      default: return '';
    }
  }

  getAppStatusClass(appointment: Appointment): string {
    const status = appointment.token?.status || appointment.status;
    switch (status) {
      case 'WAITING': return 'badge-status badge-waiting';
      case 'IN_PROGRESS': return 'badge-status badge-inprogress';
      case 'COMPLETED': return 'badge-status badge-completed';
      case 'CANCELLED': return 'badge-status badge-cancelled';
      default: return 'badge-status badge-waiting';
    }
  }

  formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
  }

  getStatusLabel(appointment: Appointment): string {
    const status = appointment.token?.status || appointment.status;
    switch (status) {
      case 'WAITING': return 'Waiting';
      case 'IN_PROGRESS': return 'In Progress';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return status || 'Scheduled';
    }
  }
}
