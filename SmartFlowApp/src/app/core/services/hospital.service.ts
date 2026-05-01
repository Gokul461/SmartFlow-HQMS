import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Hospital, Department, User, CreateHospitalRequest } from '../models';

const BASE_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private http = inject(HttpClient);

  searchHospitals(city?: string): Observable<ApiResponse<Hospital[]>> {
    const params = city ? `?city=${encodeURIComponent(city)}` : '';
    return this.http.get<ApiResponse<Hospital[]>>(`${BASE_URL}/hospitals/search${params}`);
  }

  getDepartments(hospitalId: number): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(`${BASE_URL}/hospitals/${hospitalId}/departments`);
  }

  getDoctors(departmentId: number): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${BASE_URL}/departments/${departmentId}/doctors`);
  }

  getAllHospitals(): Observable<ApiResponse<Hospital[]>> {
    return this.http.get<ApiResponse<Hospital[]>>(`${BASE_URL}/superadmin/hospitals`);
  }

  createHospital(data: CreateHospitalRequest): Observable<ApiResponse<Hospital>> {
    return this.http.post<ApiResponse<Hospital>>(`${BASE_URL}/superadmin/hospitals`, data);
  }

  activateHospital(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${BASE_URL}/superadmin/hospitals/${id}/activate`, {});
  }

  deactivateHospital(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${BASE_URL}/superadmin/hospitals/${id}/deactivate`, {});
  }

  deleteHospital(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${BASE_URL}/superadmin/hospitals/${id}`);
  }

  getAdminDepartments(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(`${BASE_URL}/admin/departments`);
  }

  createDepartment(name: string): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(`${BASE_URL}/admin/departments`, { name });
  }
}
