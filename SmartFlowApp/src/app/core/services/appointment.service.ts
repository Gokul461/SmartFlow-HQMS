import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Appointment } from '../models';

const BASE_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);

  getAvailableSlots(doctorId: number, date: string): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${BASE_URL}/appointments/slots`, {
      params: { doctorId: doctorId.toString(), date }
    });
  }

  bookAppointment(
    doctorId: number,
    departmentId: number,
    hospitalId: number,
    scheduledDate: string,
    appointmentTime: string
  ): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${BASE_URL}/appointments/book`, {
      doctorId,
      departmentId,
      hospitalId,
      scheduledDate,
      appointmentTime
    });
  }

  getMyAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.http.get<ApiResponse<Appointment[]>>(`${BASE_URL}/appointments/my`);
  }
}
