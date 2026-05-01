import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { HospitalService } from '../../../core/services/hospital.service';
import { Department } from '../../../core/models';

@Component({
  selector: 'app-patient-departments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-departments.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientDepartmentsComponent implements OnInit {
  private hospitalService = inject(HospitalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  departments: Department[] = [];
  loading = true;
  error = '';
  hospitalId: number = 0;
  hospitalName = '';

  viewDoctors(dept: Department) {
    this.router.navigate(['/patient/departments', dept.id, 'doctors'], {
      state: { hospitalId: this.hospitalId, hospitalName: this.hospitalName }
    });
  }

  ngOnInit() {
    this.hospitalId = parseInt(this.route.snapshot.paramMap.get('hospitalId') || '0', 10);
    this.hospitalService.getDepartments(this.hospitalId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.departments = res.data;
          if (this.departments.length > 0) {
            this.hospitalName = this.departments[0].hospitalName;
          }
        } else {
          this.error = res.message;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load departments.';
        this.cdr.markForCheck();
      }
    });
  }
}
