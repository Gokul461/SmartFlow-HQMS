import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse, LoginResponse } from '../models';

const BASE_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${BASE_URL}/auth/login`, { email, password }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.storeAuth(res.data);
        }
      })
    );
  }

  superAdminLogin(email: string, password: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${BASE_URL}/auth/superadmin/login`, { email, password }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.storeAuth(res.data);
        }
      })
    );
  }

  patientSignup(name: string, email: string, password: string, phone: string): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${BASE_URL}/auth/patient/signup`, { name, email, password, phone }).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.storeAuth(res.data);
        }
      })
    );
  }

  storeAuth(data: LoginResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('name', data.name);
    localStorage.setItem('email', data.email);
    if (data.departmentId)   localStorage.setItem('departmentId',   String(data.departmentId));
    if (data.departmentName) localStorage.setItem('departmentName', data.departmentName);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getName(): string | null {
    return localStorage.getItem('name');
  }

  getDepartmentId(): string | null {
    return localStorage.getItem('departmentId');
  }

  getDepartmentName(): string | null {
    return localStorage.getItem('departmentName');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
