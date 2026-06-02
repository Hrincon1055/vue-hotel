import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type {
  CheckInDto,
  CheckOutDto,
  CreateReservationDto,
  PaginatedResponse,
  Reservation,
  ReservationFilters,
  UpdateReservationDto,
} from '../interfaces/reservation.interface';

const BASE_URL = '/reservations';

export const reservationsService = {
  async getAll(filters?: ReservationFilters): Promise<PaginatedResponse<Reservation>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.customerId) params.append('customerId', filters.customerId);
      if (filters.roomId) params.append('roomId', filters.roomId);
      if (filters.checkInFrom) params.append('checkInFrom', filters.checkInFrom);
      if (filters.checkInTo) params.append('checkInTo', filters.checkInTo);
      if (filters.checkOutFrom) params.append('checkOutFrom', filters.checkOutFrom);
      if (filters.checkOutTo) params.append('checkOutTo', filters.checkOutTo);
    }

    const { data } = await api.get<Response<PaginatedResponse<Reservation>>>(
      `${BASE_URL}?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<Reservation> {
    const { data } = await api.get<Response<Reservation>>(`${BASE_URL}/${id}`);
    return data.data;
  },

  async getByCode(code: string): Promise<Reservation> {
    const { data } = await api.get<Response<Reservation>>(`${BASE_URL}/code/${code}`);
    return data.data;
  },

  async getTodayArrivals(): Promise<Reservation[]> {
    const { data } = await api.get<Response<Reservation[]>>(`${BASE_URL}/today/arrivals`);
    return data.data;
  },

  async getTodayDepartures(): Promise<Reservation[]> {
    const { data } = await api.get<Response<Reservation[]>>(`${BASE_URL}/today/departures`);
    return data.data;
  },

  async create(reservation: CreateReservationDto): Promise<Reservation> {
    const { data } = await api.post<Response<Reservation>>(BASE_URL, reservation);
    return data.data;
  },

  async update(id: string, reservation: UpdateReservationDto): Promise<Reservation> {
    const { data } = await api.patch<Response<Reservation>>(`${BASE_URL}/${id}`, reservation);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => api.delete(`${BASE_URL}/${id}`)));
  },

  async confirm(id: string): Promise<Reservation> {
    const { data } = await api.post<Response<Reservation>>(`${BASE_URL}/${id}/confirm`);
    return data.data;
  },

  async checkIn(id: string, dto?: CheckInDto): Promise<Reservation> {
    const { data } = await api.post<Response<Reservation>>(`${BASE_URL}/${id}/check-in`, dto);
    return data.data;
  },

  async checkOut(id: string, dto?: CheckOutDto): Promise<Reservation> {
    const { data } = await api.post<Response<Reservation>>(`${BASE_URL}/${id}/check-out`, dto);
    return data.data;
  },

  async cancel(id: string): Promise<Reservation> {
    const { data } = await api.post<Response<Reservation>>(`${BASE_URL}/${id}/cancel`);
    return data.data;
  },

  async noShow(id: string): Promise<Reservation> {
    const { data } = await api.post<Response<Reservation>>(`${BASE_URL}/${id}/no-show`);
    return data.data;
  },
};
