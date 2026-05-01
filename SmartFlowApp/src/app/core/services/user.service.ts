import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, User, RoleCounts, CreateStaffRequest } from '../models';

const BASE_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAllUsers(role?: string, search?: string): Observable<ApiResponse<User[]>> {
    const params: string[] = [];
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<ApiResponse<User[]>>(`${BASE_URL}/superadmin/users${query}`);
  }

  getUserRoleCounts(): Observable<ApiResponse<RoleCounts>> {
    return this.http.get<ApiResponse<RoleCounts>>(`${BASE_URL}/superadmin/users/role-counts`);
  }

  activateUser(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${BASE_URL}/superadmin/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${BASE_URL}/superadmin/users/${id}/deactivate`, {});
  }

  deleteUser(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${BASE_URL}/superadmin/users/${id}`);
  }

  getStaff(role?: string, search?: string): Observable<ApiResponse<User[]>> {
    const params: string[] = [];
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    const query = params.length ? `?${params.join('&')}` : '';
    return this.http.get<ApiResponse<User[]>>(`${BASE_URL}/admin/staff${query}`);
  }

  getStaffRoleCounts(): Observable<ApiResponse<RoleCounts>> {
    return this.http.get<ApiResponse<RoleCounts>>(`${BASE_URL}/admin/staff/role-counts`);
  }

  createStaff(data: CreateStaffRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${BASE_URL}/admin/staff`, data);
  }

  activateStaff(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${BASE_URL}/admin/staff/${id}/activate`, {});
  }

  deactivateStaff(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${BASE_URL}/admin/staff/${id}/deactivate`, {});
  }

  getPatients(search?: string): Observable<ApiResponse<User[]>> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.http.get<ApiResponse<User[]>>(`${BASE_URL}/admin/patients${query}`);
  }

  getPatientCount(): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${BASE_URL}/admin/patients/count`);
  }
}
