import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';

interface NavItem { label: string; icon: string; path: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent implements OnInit {
  authService = inject(AuthService);
  layoutService = inject(LayoutService);
  private cdr = inject(ChangeDetectorRef);

  role = '';
  name = '';
  navItems: NavItem[] = [];

  ngOnInit() {
    this.role = this.authService.getRole() || '';
    this.name = this.authService.getName() || 'User';
    this.navItems = this.getNavItems(this.role);
  }

  getNavItems(role: string): NavItem[] {
    switch (role) {
      case 'SUPER_ADMIN': return [
        { label: 'Dashboard',  icon: 'bi-speedometer2',   path: '/superadmin/dashboard' },
        { label: 'Hospitals',  icon: 'bi-hospital',       path: '/superadmin/hospitals' },
        { label: 'Users',      icon: 'bi-people',         path: '/superadmin/users' }
      ];
      case 'ADMIN': return [
        { label: 'Dashboard',   icon: 'bi-speedometer2', path: '/admin/dashboard' },
        { label: 'Departments', icon: 'bi-building',     path: '/admin/departments' },
        { label: 'Staff',       icon: 'bi-person-badge', path: '/admin/staff' },
        { label: 'Patients',    icon: 'bi-people',       path: '/admin/patients' }
      ];
      case 'RECEPTIONIST': return [
        { label: 'Queue Dashboard',   icon: 'bi-list-check',     path: '/receptionist/queue' },
        { label: 'Appointments Log',  icon: 'bi-journal-text',   path: '/receptionist/history' }
      ];
      case 'PATIENT': return [
        { label: 'Find Hospitals',  icon: 'bi-hospital',        path: '/patient/home' },
        { label: 'Appointments',    icon: 'bi-calendar-check',  path: '/patient/appointments' }
      ];
      default: return [];
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getRoleLabel(role: string): string {
    const map: Record<string,string> = {
      'SUPER_ADMIN': 'Super Admin', 'ADMIN': 'Admin',
      'RECEPTIONIST': 'Receptionist', 'PATIENT': 'Patient'
    };
    return map[role] || role;
  }

  logout() { this.authService.logout(); }
}
