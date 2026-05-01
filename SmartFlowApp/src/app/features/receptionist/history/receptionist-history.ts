import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { QueueService } from '../../../core/services/queue.service';
import { AuthService } from '../../../core/services/auth.service';
import { QueueToken } from '../../../core/models';

@Component({
  selector: 'app-receptionist-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receptionist-history.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceptionistHistoryComponent implements OnInit {
  private queueService = inject(QueueService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  tokens: QueueToken[] = [];
  loading = true;
  error = '';
  deptId: number | null = null;
  departmentName = '';
  statusFilter = '';

  today = this.localDateString(new Date());
  selectedDate = this.today;

  private localDateString(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  get filteredTokens(): QueueToken[] {
    if (!this.statusFilter) return this.tokens;
    return this.tokens.filter(t => t.status === this.statusFilter);
  }

  get completedCount(): number  { return this.tokens.filter(t => t.status === 'COMPLETED').length; }
  get cancelledCount(): number  { return this.tokens.filter(t => t.status === 'CANCELLED').length; }
  get waitingCount(): number    { return this.tokens.filter(t => t.status === 'WAITING').length; }
  get inProgressCount(): number { return this.tokens.filter(t => t.status === 'IN_PROGRESS').length; }

  ngOnInit() {
    const storedDeptId = this.authService.getDepartmentId();
    this.departmentName = this.authService.getDepartmentName() || '';
    if (storedDeptId) {
      this.deptId = parseInt(storedDeptId, 10);
      this.load();
    } else {
      this.loading = false;
      this.error = 'Department not assigned. Contact your administrator.';
    }
  }

  onDateChange() {
    this.statusFilter = '';
    this.load();
  }

  load() {
    if (!this.deptId) return;
    this.loading = true;
    this.error = '';
    this.queueService.getHistoryQueue(this.deptId, this.selectedDate).pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.tokens = res.data ?? [];
        if (!this.departmentName && this.tokens.length > 0) {
          this.departmentName = this.tokens[0].departmentName;
          localStorage.setItem('departmentName', this.departmentName);
        }
        if (!res.success) this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load history.';
        this.cdr.markForCheck();
      }
    });
  }

  formatSlotTime(token: QueueToken): string {
    const timeStr = token.appointmentTime ?? null;
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
    }
    const d = new Date(token.createdAt);
    const h = d.getHours(), m = d.getMinutes();
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'WAITING':     return 'badge-status badge-waiting';
      case 'IN_PROGRESS': return 'badge-status badge-inprogress';
      case 'COMPLETED':   return 'badge-status badge-completed';
      case 'CANCELLED':   return 'badge-status badge-cancelled';
      default:            return 'badge-status';
    }
  }

  deptIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('cardio'))   return 'bi-heart-pulse';
    if (n.includes('ortho'))    return 'bi-person-walking';
    if (n.includes('neuro'))    return 'bi-activity';
    if (n.includes('pediatr'))  return 'bi-emoji-smile';
    if (n.includes('gynae') || n.includes('obs')) return 'bi-gender-female';
    if (n.includes('ent'))      return 'bi-ear';
    if (n.includes('eye') || n.includes('ophthal')) return 'bi-eye';
    if (n.includes('derm'))     return 'bi-bandaid';
    if (n.includes('oncol'))    return 'bi-capsule';
    if (n.includes('radio') || n.includes('xray')) return 'bi-radioactive';
    if (n.includes('icu') || n.includes('emerg')) return 'bi-hospital';
    return 'bi-clipboard2-pulse';
  }

  getStatusLabel(status: string): string {
    const map: Record<string,string> = {
      'WAITING': 'Waiting', 'IN_PROGRESS': 'In Progress',
      'COMPLETED': 'Completed', 'CANCELLED': 'Cancelled'
    };
    return map[status] || status;
  }
}
