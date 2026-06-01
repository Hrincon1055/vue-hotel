import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type {
  CreateCustomerDto,
  Customer,
  CustomerFilters,
  CustomerReservation,
  PaginatedResponse,
  UpdateCustomerDto,
} from '../interfaces/customer.interface';

const BASE_URL = '/customers';

export const customersService = {
  async getAll(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.search) params.append('search', filters.search);
      if (filters.documentType) params.append('documentType', filters.documentType);
      if (filters.nationality) params.append('nationality', filters.nationality);
    }

    const { data } = await api.get<Response<PaginatedResponse<Customer>>>(
      `${BASE_URL}?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<Customer> {
    const { data } = await api.get<Response<Customer>>(`${BASE_URL}/${id}`);
    return data.data;
  },

  async create(customer: CreateCustomerDto): Promise<Customer> {
    const { data } = await api.post<Response<Customer>>(BASE_URL, customer);
    return data.data;
  },

  async update(id: string, customer: UpdateCustomerDto): Promise<Customer> {
    const { data } = await api.patch<Response<Customer>>(`${BASE_URL}/${id}`, customer);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => api.delete(`${BASE_URL}/${id}`)));
  },

  async restore(id: string): Promise<Customer> {
    const { data } = await api.post<Response<Customer>>(`${BASE_URL}/${id}/restore`);
    return data.data;
  },

  async getReservations(id: string): Promise<CustomerReservation[]> {
    const { data } = await api.get<Response<CustomerReservation[]>>(
      `${BASE_URL}/${id}/reservations`,
    );
    return data.data;
  },
};
