const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options?.headers,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw {
                    message: error.message || 'An error occurred',
                    statusCode: response.status,
                    error: error.error,
                } as ApiError;
            }

            return response.json();
        } catch (error) {
            if ((error as ApiError).statusCode) {
                throw error;
            }
            throw {
                message: 'Network error. Please check your connection.',
                statusCode: 500,
            } as ApiError;
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient(API_URL);

// API methods for attendance
export const attendanceApi = {
    verify: (data: {
        method: 'RFID' | 'PIN' | 'FACIAL';
        rfidCardId?: string;
        employeeId?: string;
        pinCode?: string;
        faceEncoding?: number[];
    }) => apiClient.post('/attendance/verify', data),

    clockIn: (data: {
        employeeId: string;
        method: 'RFID' | 'PIN' | 'FACIAL';
        rfidCardId?: string;
        pinCode?: string;
        faceEncoding?: number[];
        photoUrl?: string;
        location?: string;
    }) => apiClient.post('/attendance/clock-in', data),

    clockOut: (data: {
        employeeId: string;
        method: 'RFID' | 'PIN' | 'FACIAL';
        rfidCardId?: string;
        pinCode?: string;
        faceEncoding?: number[];
        photoUrl?: string;
        location?: string;
        notes?: string;
    }) => apiClient.post('/attendance/clock-out', data),

    getCurrentlyPresent: () => apiClient.get('/attendance/currently-present'),
};