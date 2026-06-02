export type RoomType =
  | 'SINGLE'
  | 'DOUBLE'
  | 'TWIN'
  | 'SUITE'
  | 'DELUXE'
  | 'PRESIDENTIAL'
  | 'FAMILY';

export type RoomStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'OUT_OF_SERVICE';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  capacity: number;
  description?: string;
  images?: string[];
  amenities?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  number: string;
  floor: number;
  type: RoomType;
  status?: RoomStatus;
  pricePerNight: number;
  capacity: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

export interface UpdateRoomDto {
  number?: string;
  floor?: number;
  type?: RoomType;
  status?: RoomStatus;
  pricePerNight?: number;
  capacity?: number;
  description?: string;
  images?: string[];
  amenities?: string[];
}

export interface UpdateRoomStatusDto {
  status: RoomStatus;
}

export interface RoomFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  type?: RoomType;
  status?: RoomStatus;
  floor?: number;
  minCapacity?: number;
  maxPrice?: number;
  minPrice?: number;
}

export interface RoomStats {
  total: number;
  byStatus: {
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
    maintenance: number;
    outOfService: number;
  };
  occupancyRate: string;
}

export interface RoomAvailabilityParams {
  checkInDate: string;
  checkOutDate: string;
  type?: RoomType;
  capacity?: number;
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
