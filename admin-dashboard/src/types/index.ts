export enum AuthMethod {
  RFID = 'RFID',
  PIN = 'PIN',
  FACIAL = 'FACIAL',
}

export enum AttendanceStatus {
  ON_TIME = 'ON_TIME',
  LATE = 'LATE',
  EARLY_DEPARTURE = 'EARLY_DEPARTURE',
  ABSENT = 'ABSENT',
  OVERTIME = 'OVERTIME',
  INCOMPLETE = 'INCOMPLETE',
  COMPLETED = 'COMPLETED',
}

export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  description?: string;
  colorCode?: string;
  isActive: boolean;
  employees?: Employee[];
  createdAt: string;
  updatedAt: string;
}

// src/types/index.ts - Update Employee interface
export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  department: string;
  departmentId?: string;
  position: string;
  rfidCardId?: string;
  pinCode?: string;
  photoUrl?: string;
  faceEncoding?: string;
  status: EmploymentStatus;
  shiftId: string;
  shift: Shift;
  dateJoined: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employee: Employee;
  clockInTime: string;
  clockOutTime?: string;
  clockInMethod: AuthMethod;
  clockOutMethod?: AuthMethod;
  clockInPhoto?: string;
  clockOutPhoto?: string;
  status: AttendanceStatus;
  workDurationMinutes?: number;
  overtimeMinutes?: number;
  shiftCompleted: boolean;
  clockInLocation?: string;
  clockOutLocation?: string;
  notes?: string;
  isManualEntry: boolean;
  createdAt: string;
  updatedAt: string;
  isClockedIn: boolean;
}

export interface AttendanceStatistics {
  totalRecords: number;
  onTime: number;
  late: number;
  earlyDeparture: number;
  onTimePercentage: number;
}

export interface EmployeeStatistics {
  total: number;
  byStatus: {
    active: number;
    inactive: number;
    suspended: number;
    terminated: number;
  };
  byAuthMethod: {
    withRfid: number;
    withPin: number;
    withFace: number;
  };
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onTime: number;
  late: number;
  totalShifts: number;
}



export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  UNPAID = 'UNPAID',
  STUDY = 'STUDY',
  PASS = 'PASS',
  OTHER = 'OTHER',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerName?: string;
  managerEmail?: string;
  isActive: boolean;
  employees?: Employee[];
  employeeCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Leave {
  id: string;
  employeeId: string;
  employee: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string;
  reviewComments?: string;
  reviewedAt?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}