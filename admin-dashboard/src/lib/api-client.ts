// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// export interface ApiError {
//   message: string;
//   statusCode: number;
//   error?: string;
// }

// class ApiClient {
//   private baseUrl: string;

//   constructor(baseUrl: string) {
//     this.baseUrl = baseUrl;
//   }

//   private getToken(): string | null {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('token');
//     }
//     return null;
//   }

//   private async request<T>(
//     endpoint: string,
//     options?: RequestInit
//   ): Promise<T> {
//     const url = `${this.baseUrl}${endpoint}`;
//     const token = this.getToken();

//     try {
//       const response = await fetch(url, {
//         ...options,
//         headers: {
//           'Content-Type': 'application/json',
//           ...(token && { Authorization: `Bearer ${token}` }),
//           ...options?.headers,
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 401) {
//           // Unauthorized - clear token and redirect to login
//           if (typeof window !== 'undefined') {
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             window.location.href = '/login';
//           }
//         }

//         const error = await response.json();
//         throw {
//           message: error.message || 'An error occurred',
//           statusCode: response.status,
//           error: error.error,
//         } as ApiError;
//       }

//       // Handle 204 No Content
//       if (response.status === 204) {
//         return {} as T;
//       }

//       return response.json();
//     } catch (error) {
//       if ((error as ApiError).statusCode) {
//         throw error;
//       }
//       throw {
//         message: 'Network error. Please check your connection.',
//         statusCode: 500,
//       } as ApiError;
//     }
//   }

//   async get<T>(endpoint: string): Promise<T> {
//     return this.request<T>(endpoint, { method: 'GET' });
//   }

//   async post<T>(endpoint: string, data?: any): Promise<T> {
//     return this.request<T>(endpoint, {
//       method: 'POST',
//       body: JSON.stringify(data),
//     });
//   }

//   async patch<T>(endpoint: string, data?: any): Promise<T> {
//     return this.request<T>(endpoint, {
//       method: 'PATCH',
//       body: JSON.stringify(data),
//     });
//   }

//   async delete<T>(endpoint: string): Promise<T> {
//     return this.request<T>(endpoint, { method: 'DELETE' });
//   }
// }

// export const apiClient = new ApiClient(API_URL);

// // Auth API
// export const authApi = {
//   login: (credentials: { username: string; password: string }) =>
//     apiClient.post('/auth/login', credentials),

//   register: (data: any) => apiClient.post('/auth/register', data),

//   getProfile: () => apiClient.get('/auth/profile'),

//   changePassword: (data: { currentPassword: string; newPassword: string }) =>
//     apiClient.post('/auth/change-password', data),
// };

// // Employees API
// export const employeesApi = {
//   getAll: (includeInactive?: boolean) =>
//     apiClient.get(`/employees${includeInactive ? '?includeInactive=true' : ''}`),

//   getById: (id: string) => apiClient.get(`/employees/${id}`),

//   create: (data: any) => apiClient.post('/employees', data),

//   update: (id: string, data: any) => apiClient.patch(`/employees/${id}`, data),

//   delete: (id: string) => apiClient.delete(`/employees/${id}`),

//   activate: (id: string) => apiClient.patch(`/employees/${id}/activate`),

//   deactivate: (id: string) => apiClient.patch(`/employees/${id}/deactivate`),

//   assignRfid: (id: string, rfidCardId: string) =>
//     apiClient.patch(`/employees/${id}/assign-rfid`, { rfidCardId }),

//   assignPin: (id: string, pinCode: string) =>
//     apiClient.patch(`/employees/${id}/assign-pin`, { pinCode }),

//   // assignFaceEncoding: (id: string, faceEncoding: number[]) =>
//   //   apiClient.patch(`/employees/${id}/assign-face`, { faceEncoding }),

//   assignFaceEncoding: (id: string, data: { faceEncoding: number[] }) =>
//     apiClient.patch(`/employees/${id}/assign-face`, data),

//   getStatistics: () => apiClient.get('/employees/statistics'),
// };

// // Shifts API
// export const shiftsApi = {
//   getAll: () => apiClient.get('/shifts'),

//   getActive: () => apiClient.get('/shifts/active'),

//   getById: (id: string) => apiClient.get(`/shifts/${id}`),

//   create: (data: any) => apiClient.post('/shifts', data),

//   update: (id: string, data: any) => apiClient.patch(`/shifts/${id}`, data),

//   delete: (id: string) => apiClient.delete(`/shifts/${id}`),

//   toggle: (id: string) => apiClient.patch(`/shifts/${id}/toggle`),
// };

// // Attendance API
// export const attendanceApi = {
//   getToday: () => apiClient.get('/attendance/today'),

//   getCurrentlyPresent: () => apiClient.get('/attendance/currently-present'),

//   getByEmployee: (employeeId: string, startDate?: string, endDate?: string) => {
//     const params = new URLSearchParams();
//     if (startDate) params.append('startDate', startDate);
//     if (endDate) params.append('endDate', endDate);
//     return apiClient.get(`/attendance/employee/${employeeId}?${params}`);
//   },

//   getReport: (startDate: string, endDate: string, department?: string) => {
//     const params = new URLSearchParams({ startDate, endDate });
//     if (department) params.append('department', department);
//     return apiClient.get(`/attendance/report?${params}`);
//   },

//   getById: (id: string) => apiClient.get(`/attendance/${id}`),
// };





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

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }

        const error = await response.json();
        throw {
          message: error.message || 'An error occurred',
          statusCode: response.status,
          error: error.error,
        } as ApiError;
      }

      if (response.status === 204) {
        return {} as T;
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

// Auth API
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiClient.post('/auth/login', credentials),

  register: (data: any) => apiClient.post('/auth/register', data),

  getProfile: () => apiClient.get('/auth/profile'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/auth/change-password', data),
};

// Employees API
export const employeesApi = {
  getAll: (includeInactive?: boolean) =>
    apiClient.get(`/employees${includeInactive ? '?includeInactive=true' : ''}`),

  getById: (id: string) => apiClient.get(`/employees/${id}`),

  create: (data: any) => apiClient.post('/employees', data),

  update: (id: string, data: any) => apiClient.patch(`/employees/${id}`, data),

  delete: (id: string) => apiClient.delete(`/employees/${id}`),

  activate: (id: string) => apiClient.patch(`/employees/${id}/activate`, {}),

  deactivate: (id: string) => apiClient.patch(`/employees/${id}/deactivate`, {}),

  assignRfid: (id: string, rfidCardId: string) =>
    apiClient.patch(`/employees/${id}/assign-rfid`, { rfidCardId }),

  assignPin: (id: string, pinCode: string) =>
    apiClient.patch(`/employees/${id}/assign-pin`, { pinCode }),

  assignFaceEncoding: (id: string, data: { faceEncoding: number[] }) =>
    apiClient.patch(`/employees/${id}/assign-face`, data),

  getStatistics: () => apiClient.get('/employees/statistics'),
};

// Shifts API
export const shiftsApi = {
  getAll: () => apiClient.get('/shifts'),

  getActive: () => apiClient.get('/shifts/active'),

  getById: (id: string) => apiClient.get(`/shifts/${id}`),

  create: (data: any) => apiClient.post('/shifts', data),

  update: (id: string, data: any) => apiClient.patch(`/shifts/${id}`, data),

  delete: (id: string) => apiClient.delete(`/shifts/${id}`),

  toggle: (id: string) => apiClient.patch(`/shifts/${id}/toggle`, {}),
};

// Attendance API
export const attendanceApi = {
  getToday: () => apiClient.get('/attendance/today'),

  getCurrentlyPresent: () => apiClient.get('/attendance/currently-present'),

  getByEmployee: (employeeId: string, startDate?: string, endDate?: string) => {
    const queryParams: string[] = [];
    if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return apiClient.get(`/attendance/employee/${employeeId}${queryString}`);
  },

  getReport: (startDate: string, endDate: string, department?: string) => {
    const queryParams: string[] = [
      `startDate=${encodeURIComponent(startDate)}`,
      `endDate=${encodeURIComponent(endDate)}`
    ];
    if (department) queryParams.push(`department=${encodeURIComponent(department)}`);
    const queryString = `?${queryParams.join('&')}`;
    return apiClient.get(`/attendance/report${queryString}`);
  },

  getById: (id: string) => apiClient.get(`/attendance/${id}`),

  clockIn: (data: any) => apiClient.post('/attendance/clock-in', data),

  clockOut: (data: any) => apiClient.post('/attendance/clock-out', data),

  verify: (data: any) => apiClient.post('/attendance/verify', data),
};