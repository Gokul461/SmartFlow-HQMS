import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, QueueToken } from '../models';

const BASE_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class QueueService {
  private http = inject(HttpClient);

  getTodayQueue(deptId: number): Observable<ApiResponse<QueueToken[]>> {
    return this.http.get<ApiResponse<QueueToken[]>>(`${BASE_URL}/queue/${deptId}/today`);
  }

  getLiveQueue(deptId: number): Observable<ApiResponse<QueueToken[]>> {
    return this.http.get<ApiResponse<QueueToken[]>>(`${BASE_URL}/queue/${deptId}/live`);
  }

  createWalkIn(data: { departmentId: number; doctorId: number; patientName?: string; patientId?: number }): Observable<ApiResponse<QueueToken>> {
    return this.http.post<ApiResponse<QueueToken>>(`${BASE_URL}/queue/walkin`, data);
  }

  updateStatus(tokenId: number, status: string): Observable<ApiResponse<QueueToken>> {
    return this.http.put<ApiResponse<QueueToken>>(`${BASE_URL}/queue/tokens/${tokenId}/status?status=${status}`, {});
  }

  getHistoryQueue(deptId: number, date: string): Observable<ApiResponse<QueueToken[]>> {
    return this.http.get<ApiResponse<QueueToken[]>>(`${BASE_URL}/queue/${deptId}/history?date=${date}`);
  }

  markPriority(tokenId: number): Observable<ApiResponse<QueueToken>> {
    return this.http.put<ApiResponse<QueueToken>>(`${BASE_URL}/queue/tokens/${tokenId}/priority`, {});
  }

  unmarkPriority(tokenId: number): Observable<ApiResponse<QueueToken>> {
    return this.http.put<ApiResponse<QueueToken>>(`${BASE_URL}/queue/tokens/${tokenId}/unpriority`, {});
  }
}
