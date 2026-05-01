import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  submit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Step 1 — try super admin login first
    this.authService.superAdminLogin(this.email.trim(), this.password.trim()).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.navigate(res.data.role);
        }
        this.cdr.markForCheck();
      },
      error: () => {
        // Step 2 — super admin failed, try regular login
        this.authService.login(this.email.trim(), this.password.trim()).subscribe({
          next: (res) => {
            this.loading = false;
            if (res.success) {
              this.navigate(res.data.role);
            }
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage = err.error?.message || 'Invalid email or password.';
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  private navigate(role: string) {
    switch (role) {
      case 'SUPER_ADMIN':  this.router.navigate(['/superadmin/dashboard']); break;
      case 'ADMIN':        this.router.navigate(['/admin/dashboard']);       break;
      case 'RECEPTIONIST': this.router.navigate(['/receptionist/queue']);    break;
      case 'DOCTOR':       this.router.navigate(['/doctor/queue']);          break;
      case 'PATIENT':      this.router.navigate(['/patient/home']);          break;
      default:             this.router.navigate(['/login']);
    }
  }
}