export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponse {
  token: string;
  role: string;
  userId: number;
  name: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
}

export interface Hospital {
  id: number;
  name: string;
  city: string;
  address: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: number;
  name: string;
  hospitalId: number;
  hospitalName: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  hospitalId: number;
  hospitalName: string;
  departmentId: number;
  departmentName: string;
}

export interface RoleCounts {
  ADMIN?: number;
  DOCTOR?: number;
  RECEPTIONIST?: number;
  PATIENT?: number;
}

export interface PlatformStats {
  totalHospitals: number;
  totalUsers: number;
  totalAdmins: number;
  totalDoctors: number;
  totalReceptionists: number;
  totalPatients: number;
}

export interface QueueToken {
  id: number;
  tokenNumber: number;
  priority: boolean;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  walkIn: boolean;
  patientName: string;
  doctorId: number;
  doctorName: string;
  departmentId: number;
  departmentName: string;
  createdAt: string;
  appointmentTime?: string;
}

export interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  departmentName: string;
  hospitalName: string;
  scheduledDate: string;
  appointmentTime?: string;
  status: string;
  token: QueueToken;
}

export interface CreateHospitalRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  hospitalName: string;
  hospitalCity: string;
  hospitalAddress: string;
  hospitalPhone: string;
}

export interface CreateStaffRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  departmentId: number;
}
