import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type { Customer } from '@/modules/customers/interfaces/customer.interface';
import type { Reservation } from '@/modules/reservations/interfaces/reservation.interface';
import type { Room, RoomStats } from '@/modules/rooms/interfaces/room.interface';

export const dashboardService = {
  async getRoomStats(): Promise<RoomStats> {
    const { data } = await api.get<Response<RoomStats>>('/rooms/stats');
    return data.data;
  },

  async getTodayArrivals(): Promise<Reservation[]> {
    const { data } = await api.get<Response<Reservation[]>>('/reservations/today/arrivals');
    return data.data;
  },

  async getTodayDepartures(): Promise<Reservation[]> {
    const { data } = await api.get<Response<Reservation[]>>('/reservations/today/departures');
    return data.data;
  },

  async getRecentReservations(limit = 10): Promise<Reservation[]> {
    const { data } = await api.get<
      Response<{ data: Reservation[]; meta: { total: number; totalPages: number } }>
    >(`/reservations?limit=${limit}&sortBy=createdAt&sortOrder=desc`);
    return data.data.data;
  },

  async getAvailableRooms(): Promise<Room[]> {
    const { data } = await api.get<
      Response<{ data: Room[]; meta: { total: number; totalPages: number } } | Room[]>
    >('/rooms?status=AVAILABLE&limit=100');
    if (Array.isArray(data.data)) {
      return data.data;
    }
    return data.data?.data ?? [];
  },

  async getOccupiedRooms(): Promise<Room[]> {
    const { data } = await api.get<
      Response<{ data: Room[]; meta: { total: number; totalPages: number } } | Room[]>
    >('/rooms?status=OCCUPIED&limit=100');
    // Manejar ambos formatos: paginado o array directo
    if (Array.isArray(data.data)) {
      return data.data;
    }
    return data.data?.data ?? [];
  },

  async getCleaningRooms(): Promise<Room[]> {
    const { data } = await api.get<
      Response<{ data: Room[]; meta: { total: number; totalPages: number } } | Room[]>
    >('/rooms?status=CLEANING&limit=100');
    if (Array.isArray(data.data)) {
      return data.data;
    }
    return data.data?.data ?? [];
  },

  async getMaintenanceRooms(): Promise<Room[]> {
    const { data } = await api.get<
      Response<{ data: Room[]; meta: { total: number; totalPages: number } } | Room[]>
    >('/rooms?status=MAINTENANCE&limit=100');
    if (Array.isArray(data.data)) {
      return data.data;
    }
    return data.data?.data ?? [];
  },

  async getCustomersCount(): Promise<number> {
    const { data } =
      await api.get<Response<{ data: Customer[]; meta: { total: number; totalPages: number } }>>(
        '/customers?limit=1',
      );
    return data.data.meta.total;
  },

  async getReservationsStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    checkedIn: number;
  }> {
    const [pendingRes, confirmedRes, checkedInRes, totalRes] = await Promise.all([
      api.get<Response<{ data: Reservation[]; meta: { total: number } }>>(
        '/reservations?status=PENDING&limit=1',
      ),
      api.get<Response<{ data: Reservation[]; meta: { total: number } }>>(
        '/reservations?status=CONFIRMED&limit=1',
      ),
      api.get<Response<{ data: Reservation[]; meta: { total: number } }>>(
        '/reservations?status=CHECKED_IN&limit=1',
      ),
      api.get<Response<{ data: Reservation[]; meta: { total: number } }>>('/reservations?limit=1'),
    ]);

    return {
      total: totalRes.data.data.meta.total,
      pending: pendingRes.data.data.meta.total,
      confirmed: confirmedRes.data.data.meta.total,
      checkedIn: checkedInRes.data.data.meta.total,
    };
  },
};
