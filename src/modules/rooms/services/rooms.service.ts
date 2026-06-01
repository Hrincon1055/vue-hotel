import { api } from '@/api/useApi';
import type { Response } from '@/modules/common/interfaces/response';
import type {
  CreateRoomDto,
  PaginatedResponse,
  Room,
  RoomAvailabilityParams,
  RoomFilters,
  RoomStats,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from '../interfaces/room.interface';

const BASE_URL = '/rooms';

export const roomsService = {
  async getAll(filters?: RoomFilters): Promise<PaginatedResponse<Room>> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.floor) params.append('floor', String(filters.floor));
      if (filters.minCapacity) params.append('minCapacity', String(filters.minCapacity));
      if (filters.maxPrice) params.append('maxPrice', String(filters.maxPrice));
      if (filters.minPrice) params.append('minPrice', String(filters.minPrice));
    }

    const { data } = await api.get<Response<PaginatedResponse<Room>>>(
      `${BASE_URL}?${params.toString()}`,
    );
    return data.data;
  },

  async getById(id: string): Promise<Room> {
    const { data } = await api.get<Response<Room>>(`${BASE_URL}/${id}`);
    return data.data;
  },

  async create(room: CreateRoomDto): Promise<Room> {
    const { data } = await api.post<Response<Room>>(BASE_URL, room);
    return data.data;
  },

  async update(id: string, room: UpdateRoomDto): Promise<Room> {
    const { data } = await api.patch<Response<Room>>(`${BASE_URL}/${id}`, room);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },

  async deleteMany(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => api.delete(`${BASE_URL}/${id}`)));
  },

  async restore(id: string): Promise<Room> {
    const { data } = await api.post<Response<Room>>(`${BASE_URL}/${id}/restore`);
    return data.data;
  },

  async updateStatus(id: string, dto: UpdateRoomStatusDto): Promise<Room> {
    const { data } = await api.patch<Response<Room>>(`${BASE_URL}/${id}/status`, dto);
    return data.data;
  },

  async getStats(): Promise<RoomStats> {
    const { data } = await api.get<Response<RoomStats>>(`${BASE_URL}/stats`);
    return data.data;
  },

  async checkAvailability(params: RoomAvailabilityParams): Promise<Room[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('checkInDate', params.checkInDate);
    queryParams.append('checkOutDate', params.checkOutDate);
    if (params.type) queryParams.append('type', params.type);
    if (params.capacity) queryParams.append('capacity', String(params.capacity));

    const { data } = await api.get<Response<Room[]>>(
      `${BASE_URL}/availability?${queryParams.toString()}`,
    );
    return data.data;
  },
};
