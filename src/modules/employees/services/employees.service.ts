import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type {
  ChangePasswordDto,
  CreateEmployeeDto,
  Employee,
  EmployeeFilters,
  PaginatedResponse,
  UpdateEmployeeDto,
} from '../interfaces/employee.interface';

const BASE_URL = '/employees';

export const employeesService = {
  async getAll(filters?: EmployeeFilters): Promise<PaginatedResponse<Employee>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
    }

    const { data } = await api.get<Response<PaginatedResponse<Employee>>>(
      `${BASE_URL}?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<Employee> {
    const { data } = await api.get<Response<Employee>>(`${BASE_URL}/${id}`);
    return data.data;
  },

  async create(employee: CreateEmployeeDto): Promise<Employee> {
    const { data } = await api.post<Response<Employee>>(BASE_URL, employee);
    return data.data;
  },

  async update(id: string, employee: UpdateEmployeeDto): Promise<Employee> {
    const { data } = await api.patch<Response<Employee>>(`${BASE_URL}/${id}`, employee);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => api.delete(`${BASE_URL}/${id}`)));
  },

  async restore(id: string): Promise<Employee> {
    const { data } = await api.post<Response<Employee>>(`${BASE_URL}/${id}/restore`);
    return data.data;
  },

  async changePassword(id: string, dto: ChangePasswordDto): Promise<void> {
    await api.patch(`${BASE_URL}/${id}/change-password`, dto);
  },

  async changeOwnPassword(dto: ChangePasswordDto): Promise<void> {
    await api.patch(`${BASE_URL}/me/change-password`, dto);
  },
};
