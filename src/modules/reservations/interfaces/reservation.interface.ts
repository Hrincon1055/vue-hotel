import type { Customer } from '@/modules/customers/interfaces/customer.interface';
import type { Room } from '@/modules/rooms/interfaces/room.interface';

export type ReservationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Reservation {
  id: string;
  reservationCode: string;
  customerId: string;
  customer?: Customer;
  roomId: string;
  room?: Room;
  checkInDate: string;
  checkOutDate: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDto {
  customerId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  children?: number;
  notes?: string;
}

export interface UpdateReservationDto {
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  children?: number;
  notes?: string;
  status?: ReservationStatus;
}

export interface CheckInDto {
  notes?: string;
}

export interface CheckOutDto {
  notes?: string;
}

export interface ReservationFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: ReservationStatus;
  customerId?: string;
  roomId?: string;
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
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

// ─── Multi-Room Reservations ────────────────────────────────────────────────

export interface CreateMultiRoomReservationRoomDto {
  roomId: string;
  adults?: number;
  children?: number;
  notes?: string;
}

export interface CreateMultiRoomReservationDto {
  customerId: string;
  checkInDate: string;
  checkOutDate: string;
  rooms: CreateMultiRoomReservationRoomDto[];
  notes?: string;
}

export interface MultiRoomReservation {
  id: string;
  reservationCode: string;
  customerId: string;
  customer?: Customer;
  checkInDate: string;
  checkOutDate: string;
  reservations: Reservation[];
  totalAmount: number;
  roomsCount?: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MultiRoomReservationFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  customerId?: string;
  roomId?: string;
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
}
