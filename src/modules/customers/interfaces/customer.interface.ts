export type DocumentType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'OTHER';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType: DocumentType;
  documentNumber: string;
  address?: string;
  nationality?: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  documentType: DocumentType;
  documentNumber: string;
  address?: string;
  nationality?: string;
  birthDate?: string;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  address?: string;
  nationality?: string;
  birthDate?: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  documentType?: DocumentType;
  nationality?: string;
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
