import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { QueueService } from '../../../core/services/queue.service';
import { HospitalService } from '../../../core/services/hospital.service';
import { AuthService } from '../../../core/services/auth.service';
import { QueueToken, User } from '../../../core/models';

@Component({
  selector: 'app-receptionist-queue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receptionist-queue.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceptionistQueueComponent implements OnInit, OnDestroy {
  private queueService    = inject(QueueService);
  private hospitalService = inject(HospitalService); // used for loadDoctors
  private authService     = inject(AuthService);
  private cdr             = inject(ChangeDetectorRef);

  tokens: QueueToken[] = [];
  doctors: User[]      = [];
  loading        = true;
  error          = '';
  deptId: number | null = null;
  departmentName = '';

  statusFilter = 'ACTIVE';

  // Walk-in Modal
  showWalkInModal  = false;
  walkInLoading    = false;
  walkInError      = '';
  selectedDoctorId: number = 0;
  walkInPatientName = '';

  // Per-row action loading
  actionLoadingId: number | null = null;

  private now = new Date();
  private clockTick: any;

  sortBySlotTime(list: QueueToken[]): QueueToken[] {
    return [...list].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      const timeA = a.appointmentTime ?? a.createdAt;
      const timeB = b.appointmentTime ?? b.createdAt;
      return timeA < timeB ? -1 : timeA > timeB ? 1 : 0;
    });
  }

  get filteredTokens(): QueueToken[] {
    if (this.statusFilter === 'ACTIVE')
      return this.sortBySlotTime(this.tokens.filter(t => t.status === 'WAITING' || t.status === 'IN_PROGRESS'));
    if (!this.statusFilter) return this.sortBySlotTime(this.tokens);
    return this.sortBySlotTime(this.tokens.filter(t => t.status === this.statusFilter));
  }

  ngOnInit() {
    const storedDeptId = this.authService.getDepartmentId();
    if (storedDeptId) {
      this.deptId = parseInt(storedDeptId, 10);
      this.departmentName = this.authService.getDepartmentName() || '';
      this.loadQueue();
      this.loadDoctors();
    } else {
      this.loading = false;
      this.error = 'Department not assigned. Contact your administrator.';
      this.cdr.markForCheck();
    }
    this.clockTick = setInterval(() => {
      this.now = new Date();
      this.cdr.markForCheck();
    }, 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.clockTick);
  }

  loadQueue() {
    if (!this.deptId) return;
    this.loading = true;
    this.error   = '';
    this.queueService.getTodayQueue(this.deptId).pipe(
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
        this.error = err.error?.message || 'Failed to load queue.';
        this.cdr.markForCheck();
      }
    });
  }

  loadDoctors() {
    if (!this.deptId) return;
    this.hospitalService.getDoctors(this.deptId).subscribe({
      next: (res) => {
        if (res.success) this.doctors = res.data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  // ── Walk-in ────────────────────────────────────────────────────────────────

  openWalkInModal() {
    this.walkInError       = '';
    this.walkInPatientName = '';
    const firstActive = this.doctors.find(d => d.isActive);
    this.selectedDoctorId = firstActive ? firstActive.id : 0;
    this.showWalkInModal  = true;
  }

  closeWalkInModal() {
    this.showWalkInModal = false;
    this.walkInError     = '';
  }

  createWalkIn() {
    if (!this.deptId || !this.selectedDoctorId) {
      this.walkInError = 'Please select a doctor.';
      return;
    }
    const doctor = this.doctors.find(d => d.id === this.selectedDoctorId);
    if (doctor && !doctor.isActive) {
      this.walkInError = 'Selected doctor is inactive. Please choose an active doctor.';
      return;
    }
    this.walkInLoading = true;
    this.walkInError   = '';

    const payload: any = { departmentId: this.deptId, doctorId: this.selectedDoctorId };
    if (this.walkInPatientName) payload.patientName = this.walkInPatientName;

    this.queueService.createWalkIn(payload).subscribe({
      next: (res) => {
        this.walkInLoading = false;
        if (res.success) { this.closeWalkInModal(); this.loadQueue(); }
        else this.walkInError = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.walkInLoading = false;
        this.walkInError   = err.error?.message || 'Failed to create walk-in.';
        this.cdr.markForCheck();
      }
    });
  }

  // ── Status actions ─────────────────────────────────────────────────────────

  private updateTokenStatus(token: QueueToken, status: string) {
    this.actionLoadingId = token.id;
    this.cdr.markForCheck();
    this.queueService.updateStatus(token.id, status).pipe(
      finalize(() => { this.actionLoadingId = null; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          const idx = this.tokens.findIndex(t => t.id === token.id);
          if (idx > -1) this.tokens[idx] = { ...this.tokens[idx], status: status as any };
        }
        this.loadQueue();
        this.cdr.markForCheck();
      },
      error: () => { this.loadQueue(); }
    });
  }

  startProgress(token: QueueToken) { this.updateTokenStatus(token, 'IN_PROGRESS'); }
  complete(token: QueueToken)      { this.updateTokenStatus(token, 'COMPLETED');   }
  cancel(token: QueueToken)        { this.updateTokenStatus(token, 'CANCELLED');   }

  togglePriority(token: QueueToken) {
    this.actionLoadingId = token.id;
    this.cdr.markForCheck();
    const call = token.priority
      ? this.queueService.unmarkPriority(token.id)
      : this.queueService.markPriority(token.id);
    call.pipe(
      finalize(() => { this.actionLoadingId = null; this.cdr.markForCheck(); })
    ).subscribe({ next: () => this.loadQueue(), error: () => {} });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  get waitingCount(): number    { return this.tokens.filter(t => t.status === 'WAITING').length; }
  get inProgressCount(): number { return this.tokens.filter(t => t.status === 'IN_PROGRESS').length; }
  get completedCount(): number  { return this.tokens.filter(t => t.status === 'COMPLETED').length; }
  get cancelledCount(): number  { return this.tokens.filter(t => t.status === 'CANCELLED').length; }

  filteredTokensCount(filter: string): number {
    if (filter === 'ACTIVE')
      return this.tokens.filter(t => t.status === 'WAITING' || t.status === 'IN_PROGRESS').length;
    return this.tokens.filter(t => t.status === filter).length;
  }

  formatSlotTime(token: QueueToken): string {
    if (token.walkIn) return '—';
    const timeStr = token.appointmentTime ?? null;
    if (timeStr) {
      // appointmentTime arrives as "HH:mm:ss" from LocalTime — parse manually
      const [h, m] = timeStr.split(':').map(Number);
      const suffix = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
    }
    return '—';
  }

  getEstimatedTime(token: QueueToken): string {
    if (token.walkIn) return '—';
    if (token.status !== 'WAITING') return '—';
    if (!token.appointmentTime) return '—';

    const [ah, am] = token.appointmentTime.split(':').map(Number);
    const diff = (ah * 60 + am) - (this.now.getHours() * 60 + this.now.getMinutes());

    if (diff <= 0) return 'Now';
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `~${h}h ${m > 0 ? m + 'm' : ''}`.trim() : `~${m} min`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      WAITING:     'badge-status badge-waiting',
      IN_PROGRESS: 'badge-status badge-inprogress',
      COMPLETED:   'badge-status badge-completed',
      CANCELLED:   'badge-status badge-cancelled',
    };
    return map[status] ?? 'badge-status';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      WAITING:     'Waiting',
      IN_PROGRESS: 'In Progress',
      COMPLETED:   'Completed',
      CANCELLED:   'Cancelled',
    };
    return map[status] ?? status;
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
}
