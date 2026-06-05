import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type {
  CreateMultiRoomReservationDto,
  MultiRoomReservation,
  MultiRoomReservationFilters,
  PaginatedResponse,
} from '../interfaces/reservation.interface';

const BASE_URL = '/reservations/multi-room';

function buildParams(filters?: MultiRoomReservationFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (!filters) return params;
  const entries: [string, string | undefined][] = [
    ['page', filters.page ? String(filters.page) : undefined],
    ['limit', filters.limit ? String(filters.limit) : undefined],
    ['sortBy', filters.sortBy],
    ['sortOrder', filters.sortOrder],
    ['search', filters.search],
    ['customerId', filters.customerId],
    ['roomId', filters.roomId],
    ['checkInFrom', filters.checkInFrom],
    ['checkInTo', filters.checkInTo],
    ['checkOutFrom', filters.checkOutFrom],
    ['checkOutTo', filters.checkOutTo],
  ];
  for (const [key, value] of entries) {
    if (value) params.append(key, value);
  }
  return params;
}

export const multiRoomReservationsService = {
  async getAll(
    filters?: MultiRoomReservationFilters,
  ): Promise<PaginatedResponse<MultiRoomReservation>> {
    const params = buildParams(filters);
    const { data } = await api.get<Response<PaginatedResponse<MultiRoomReservation>>>(
      `${BASE_URL}?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<MultiRoomReservation> {
    const { data } = await api.get<Response<MultiRoomReservation>>(`${BASE_URL}/${id}`);
    return data.data;
  },

  async getByCode(code: string): Promise<MultiRoomReservation> {
    const { data } = await api.get<Response<MultiRoomReservation>>(`${BASE_URL}/code/${code}`);
    return data.data;
  },

  async create(dto: CreateMultiRoomReservationDto): Promise<MultiRoomReservation> {
    const { data } = await api.post<Response<MultiRoomReservation>>(BASE_URL, dto);
    return data.data;
  },

  async confirm(id: string): Promise<MultiRoomReservation> {
    const { data } = await api.post<Response<MultiRoomReservation>>(`${BASE_URL}/${id}/confirm`);
    return data.data;
  },

  async cancel(id: string): Promise<MultiRoomReservation> {
    const { data } = await api.post<Response<MultiRoomReservation>>(`${BASE_URL}/${id}/cancel`);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => api.delete(`${BASE_URL}/${id}`)));
  },
};
