export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  employee: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: EmployeeRole;
  };
}

export type EmployeeRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';
