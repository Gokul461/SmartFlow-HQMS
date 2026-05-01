import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent implements OnInit {
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  layoutService = inject(LayoutService);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  pageTitle = 'Dashboard';
  name = '';
  role = '';

  private titleMap: Record<string, string> = {
    '/superadmin/dashboard': 'Dashboard',
    '/superadmin/hospitals': 'Hospitals',
    '/superadmin/users': 'Users',
    '/admin/dashboard': 'Dashboard',
    '/admin/departments': 'Departments',
    '/admin/staff': 'Staff Management',
    '/receptionist/queue': 'Queue Dashboard',
    '/receptionist/history': 'Appointments Log',
    '/patient/home': 'Find Hospitals',
    '/patient/appointments': 'My Appointments',
    '/patient/book': 'Book Appointment'
  };

  ngOnInit() {
    this.name = this.authService.getName() || 'User';
    this.role = this.authService.getRole() || '';
    this.updateTitle(this.router.url);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.updateTitle(e.urlAfterRedirects || e.url);
      this.cdr.markForCheck();
    });
  }

  updateTitle(url: string) {
    const found = Object.entries(this.titleMap).find(([key]) => url.includes(key));
    if (found) this.pageTitle = found[1];
    else if (url.includes('/departments')) this.pageTitle = 'Departments';
    else if (url.includes('/doctors')) this.pageTitle = 'Doctors';
    else this.pageTitle = 'SmartFlow';
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
}
