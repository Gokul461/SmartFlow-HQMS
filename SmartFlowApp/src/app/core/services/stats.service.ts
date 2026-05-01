import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PlatformStats, RoleCounts } from '../models';

const BASE_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);

  getPlatformStats(): Observable<ApiResponse<PlatformStats>> {
    return this.http.get<ApiResponse<PlatformStats>>(`${BASE_URL}/superadmin/stats`);
  }

  getAdminRoleCounts(): Observable<ApiResponse<RoleCounts>> {
    return this.http.get<ApiResponse<RoleCounts>>(`${BASE_URL}/admin/staff/role-counts`);
  }
}
