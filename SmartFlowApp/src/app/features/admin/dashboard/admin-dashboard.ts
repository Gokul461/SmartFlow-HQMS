import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../../core/services/stats.service';
import { UserService } from '../../../core/services/user.service';
import { RoleCounts } from '../../../core/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  private statsService = inject(StatsService);
  private userService  = inject(UserService);
  private cdr          = inject(ChangeDetectorRef);

  roleCounts: RoleCounts = {};
  patientCount = 0;
  loading = true;
  error   = '';

  ngOnInit() {
    this.statsService.getAdminRoleCounts().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.roleCounts = res.data;
          this.patientCount = (res.data as any)['PATIENT'] ?? 0;
        } else {
          this.error = res.message;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to load stats.';
        this.cdr.markForCheck();
      }
    });
  }

  getCount(role: string): number {
    return (this.roleCounts as any)[role] || 0;
  }
}
