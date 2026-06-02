import type { Customer } from '@/modules/customers/interfaces/customer.interface';
import type { Reservation } from '@/modules/reservations/interfaces/reservation.interface';
import type { Room, RoomStats } from '@/modules/rooms/interfaces/room.interface';

export interface DashboardStats {
  rooms: RoomStats;
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    checkedIn: number;
    todayArrivals: number;
    todayDepartures: number;
  };
  customers: {
    total: number;
  };
  occupancyRate: number;
}

export interface DashboardData {
  stats: DashboardStats;
  todayArrivals: Reservation[];
  todayDepartures: Reservation[];
  recentReservations: Reservation[];
  availableRooms: Room[];
  occupiedRooms: Room[];
  cleaningRooms: Room[];
  frequentCustomers: FrequentCustomer[];
}

export interface FrequentCustomer extends Customer {
  reservationCount: number;
}

export interface StatCardData {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  subtitle?: string;
  progress?: number;
}
