import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { StatsService } from '../../../core/services/stats.service';
import { PlatformStats } from '../../../core/models';

@Component({
  selector: 'app-sa-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sa-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaDashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  private cdr = inject(ChangeDetectorRef);

  stats: PlatformStats = {
    totalHospitals: 0, totalUsers: 0, totalAdmins: 0,
    totalDoctors: 0, totalReceptionists: 0, totalPatients: 0
  };
  loading = true;
  error = '';

  ngOnInit() {
    this.statsService.getPlatformStats().pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        if (res.success) this.stats = res.data ?? this.stats;
        else this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load statistics.';
        this.cdr.markForCheck();
      }
    });
  }
}
