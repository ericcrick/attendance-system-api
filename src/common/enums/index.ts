export enum AuthMethod {
    RFID = 'RFID',
    FACIAL = 'FACIAL',
    PIN = 'PIN',
}

export enum AttendanceStatus {
    ON_TIME = 'ON_TIME',
    LATE = 'LATE',
    EARLY_DEPARTURE = 'EARLY_DEPARTURE',
    ABSENT = 'ABSENT',
}

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    SUPERVISOR = 'SUPERVISOR',
    EMPLOYEE = 'EMPLOYEE',
}

export enum EmploymentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    TERMINATED = 'TERMINATED',
}