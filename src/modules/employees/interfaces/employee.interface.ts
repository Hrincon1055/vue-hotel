export type EmployeeRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
}

export interface UpdateEmployeeDto {
  firstName?: string;
  lastName?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
  password?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
}

export interface EmployeeFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  role?: EmployeeRole;
  status?: EmployeeStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
