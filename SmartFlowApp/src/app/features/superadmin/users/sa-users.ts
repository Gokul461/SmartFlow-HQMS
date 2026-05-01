import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { User, RoleCounts } from '../../../core/models';

@Component({
  selector: 'app-sa-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './sa-users.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaUsersComponent implements OnInit {
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  roleCounts: RoleCounts = {};
  loading = true;
  error = '';
  searchTerm = '';
  filterRole = '';

  // Confirm
  showConfirm = false;
  confirmId: number | null = null;
  confirmName = '';

  ngOnInit() {
    this.loadRoleCounts();
    this.loadUsers();
  }

  loadRoleCounts() {
    this.userService.getUserRoleCounts().subscribe({
      next: (res) => {
        if (res.success) this.roleCounts = res.data;
        this.cdr.markForCheck();
      },
      error: () => {}
    });
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getAllUsers(this.filterRole || undefined, this.searchTerm || undefined).pipe(
      finalize(() => { this.loading = false; this.cdr.markForCheck(); })
    ).subscribe({
      next: (res) => {
        this.users = res.data ?? [];
        if (!res.success) this.error = res.message;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load users.';
        this.cdr.markForCheck();
      }
    });
  }

  private searchTimer: any;
  onSearchInput() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadUsers(), 300);
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadUsers();
  }

  setFilter(role: string) {
    this.filterRole = role;
    this.loadUsers();
  }

  getTotalCount(): number {
    return Object.values(this.roleCounts).reduce((sum, v) => sum + (v || 0), 0);
  }

  activate(id: number) {
    this.userService.activateUser(id).subscribe({
      next: () => { this.loadUsers(); this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  deactivate(id: number) {
    this.userService.deactivateUser(id).subscribe({
      next: () => { this.loadUsers(); this.cdr.markForCheck(); },
      error: () => {}
    });
  }

  confirmDelete(user: User) {
    this.confirmId = user.id;
    this.confirmName = user.name;
    this.showConfirm = true;
  }

  cancelDelete() {
    this.showConfirm = false;
    this.confirmId = null;
  }

  deleteUser() {
    if (!this.confirmId) return;
    this.userService.deleteUser(this.confirmId).subscribe({
      next: () => {
        this.showConfirm = false;
        this.confirmId = null;
        this.loadUsers();
        this.loadRoleCounts();
        this.cdr.markForCheck();
      },
      error: () => {
        this.showConfirm = false;
        this.cdr.markForCheck();
      }
    });
  }

  getRoleCount(role: string): number {
    return (this.roleCounts as any)[role] || 0;
  }
}
