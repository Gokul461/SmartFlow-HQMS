import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HospitalService } from '../../../core/services/hospital.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-patient-doctors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-doctors.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDoctorsComponent implements OnInit {
  private hospitalService = inject(HospitalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  doctors: User[] = [];
  loading = true;
  error = '';
  departmentId: number = 0;
  departmentName = '';
  hospitalId: number = 0;
  hospitalName = '';

  ngOnInit() {
    this.departmentId = parseInt(this.route.snapshot.paramMap.get('departmentId') || '0', 10);
    const state = window.history.state;
    if (state?.hospitalId)   this.hospitalId   = state.hospitalId;
    if (state?.hospitalName) this.hospitalName = state.hospitalName;

    this.hospitalService.getDoctors(this.departmentId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.doctors = res.data;
          if (this.doctors.length > 0) {
            this.departmentName = this.doctors[0].departmentName;
          }
        } else {
          this.error = res.message;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load doctors.';
        this.cdr.markForCheck();
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  bookAppointment(doctor: User) {
    this.router.navigate(['/patient/book'], {
      state: {
        doctorId:       doctor.id,
        doctorName:     doctor.name,
        departmentId:   this.departmentId,
        departmentName: this.departmentName,
        hospitalId:     this.hospitalId,
        hospitalName:   this.hospitalName
      }
    });
  }
}
