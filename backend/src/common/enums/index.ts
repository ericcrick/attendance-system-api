// export enum AuthMethod {
//     RFID = 'RFID',
//     FACIAL = 'FACIAL',
//     PIN = 'PIN',
// }

// export enum AttendanceStatus {
//     ON_TIME = 'ON_TIME',
//     LATE = 'LATE',
//     EARLY_DEPARTURE = 'EARLY_DEPARTURE',
//     ABSENT = 'ABSENT',
//     OVERTIME = 'OVERTIME',
//     INCOMPLETE = 'INCOMPLETE', // Didn't clock out
//     COMPLETED = 'COMPLETED', // Completed shift
// }

// export enum UserRole {
//     SUPER_ADMIN = 'SUPER_ADMIN',
//     ADMIN = 'ADMIN',
//     SUPERVISOR = 'SUPERVISOR',
//     EMPLOYEE = 'EMPLOYEE',
// }

// export enum EmploymentStatus {
//     ACTIVE = 'ACTIVE',
//     INACTIVE = 'INACTIVE',
//     SUSPENDED = 'SUSPENDED',
//     TERMINATED = 'TERMINATED',
// }


// src/common/enums.ts
export enum AuthMethod {
  RFID = 'RFID',
  PIN = 'PIN',
  FACIAL = 'FACIAL',
  FINGERPRINT = 'FINGERPRINT',
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