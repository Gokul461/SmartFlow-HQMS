import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  name = '';
  email = '';
  password = '';
  phone = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  submit() {
    if (!this.name || !this.email || !this.password || !this.phone) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.patientSignup(this.name, this.email, this.password, this.phone).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.successMessage = 'Account created successfully!';
          setTimeout(() => this.router.navigate(['/patient/home']), 1000);
        } else {
          this.errorMessage = res.message || 'Signup failed.';
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        this.cdr.markForCheck();
      }
    });
  }
}
