import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { QueueService } from '../../../core/services/queue.service';
import { QueueToken } from '../../../core/models';

@Component({
  selector: 'app-live-queue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-queue.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveQueueComponent implements OnInit, OnDestroy {
  private queueService = inject(QueueService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  deptId: number = 0;
  tokens: QueueToken[] = [];
  loading = true;
  error = '';
  departmentName = '';
  private intervalId: any;

  ngOnInit() {
    this.deptId = parseInt(this.route.snapshot.paramMap.get('deptId') || '0', 10);
    this.loadQueue();
    this.intervalId = setInterval(() => this.loadQueue(), 5000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  loadQueue() {
    if (!this.deptId) return;
    this.queueService.getLiveQueue(this.deptId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.tokens = res.data;
          if (this.tokens.length > 0) {
            this.departmentName = this.tokens[0].departmentName;
          }
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get nowServing(): QueueToken | null {
    return this.tokens.find(t => t.status === 'IN_PROGRESS') || null;
  }

  get waitingTokens(): QueueToken[] {
    const waiting = this.tokens.filter(t => t.status === 'WAITING');
    // Sort: priority first
    return waiting.sort((a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0));
  }
}
