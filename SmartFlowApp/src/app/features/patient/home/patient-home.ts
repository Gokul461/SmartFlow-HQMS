import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HospitalService } from '../../../core/services/hospital.service';
import { Hospital } from '../../../core/models';

@Component({
  selector: 'app-patient-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientHomeComponent implements OnInit {
  private hospitalService = inject(HospitalService);
  private cdr = inject(ChangeDetectorRef);

  allHospitals: Hospital[] = [];
  filteredHospitals: Hospital[] = [];
  loading = false;
  error = '';
  citySearch = '';

  ngOnInit() {
    this.loadHospitals();
  }

  loadHospitals() {
    this.loading = true;
    this.error = '';
    this.hospitalService.searchHospitals().pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.allHospitals = res.data ?? [];
        this.filteredHospitals = this.allHospitals;
        if (!res.success) this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load hospitals.';
        this.cdr.markForCheck();
      }
    });
  }

  onCitySearch() {
    const term = this.citySearch.trim().toLowerCase();
    this.filteredHospitals = term
      ? this.allHospitals.filter(h => h.city?.toLowerCase().includes(term))
      : this.allHospitals;
    this.cdr.markForCheck();
  }
}
