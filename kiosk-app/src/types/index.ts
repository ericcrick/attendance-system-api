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
}

export enum EmploymentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    TERMINATED = 'TERMINATED',
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
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email?: string;
    phone?: string;
    department: string;
    position: string;
    rfidCardId?: string;
    photoUrl?: string;
    status: EmploymentStatus;
    shiftId: string;
    shift: Shift;
    dateJoined: string;
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
    clockInLocation?: string;
    clockOutLocation?: string;
    notes?: string;
    isManualEntry: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface VerifyResponse {
    employee: {
        id: string;
        employeeId: string;
        fullName: string;
        department: string;
        position: string;
        shift: Shift;
    };
    verified: boolean;
}