import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup').then(m => m.SignupComponent)
  },
  {
    path: 'superadmin/login',
    loadComponent: () => import('./features/auth/superadmin-login/superadmin-login').then(m => m.SuperAdminLoginComponent)
  },
  {
    path: 'superadmin',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/superadmin/dashboard/sa-dashboard').then(m => m.SaDashboardComponent)
      },
      {
        path: 'hospitals',
        loadComponent: () => import('./features/superadmin/hospitals/sa-hospitals').then(m => m.SaHospitalsComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/superadmin/users/sa-users').then(m => m.SaUsersComponent)
      }
    ]
  },
  {
    path: 'admin',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [roleGuard(['ADMIN'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'departments',
        loadComponent: () => import('./features/admin/departments/admin-departments').then(m => m.AdminDepartmentsComponent)
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/admin/staff/admin-staff').then(m => m.AdminStaffComponent)
      },
      {
        path: 'patients',
        loadComponent: () => import('./features/admin/patients/admin-patients').then(m => m.AdminPatientsComponent)
      }
    ]
  },
  {
    path: 'receptionist',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [roleGuard(['RECEPTIONIST'])],
    children: [
      { path: '', redirectTo: 'queue', pathMatch: 'full' },
      {
        path: 'queue',
        loadComponent: () => import('./features/receptionist/queue/receptionist-queue').then(m => m.ReceptionistQueueComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/receptionist/history/receptionist-history').then(m => m.ReceptionistHistoryComponent)
      }
    ]
  },
  {
    path: 'patient',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [roleGuard(['PATIENT'])],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./features/patient/home/patient-home').then(m => m.PatientHomeComponent)
      },
      {
        path: 'hospitals/:hospitalId/departments',
        loadComponent: () => import('./features/patient/departments/patient-departments').then(m => m.PatientDepartmentsComponent)
      },
      {
        path: 'departments/:departmentId/doctors',
        loadComponent: () => import('./features/patient/doctors/patient-doctors').then(m => m.PatientDoctorsComponent)
      },
      {
        path: 'book',
        loadComponent: () => import('./features/patient/book/patient-book').then(m => m.PatientBookComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/patient/appointments/patient-appointments').then(m => m.PatientAppointmentsComponent)
      }
    ]
  },
  {
    path: 'queue/live/:deptId',
    loadComponent: () => import('./features/queue/live/live-queue').then(m => m.LiveQueueComponent)
  },
  { path: '**', redirectTo: 'login' }
];
