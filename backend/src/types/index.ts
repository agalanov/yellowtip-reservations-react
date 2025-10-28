// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    loginId: string;
    firstName?: string | null;
    lastName?: string | null;
    status: string;
  };
}

// Booking Types
export interface BookingRequest {
  date: number;
  serviceId: number;
  servicePackageId?: number;
  time: number;
  roomId: number;
  guestId: number;
  therapistId?: number;
  comment?: string;
  preDuration?: number;
  postDuration?: number;
  priority?: number;
  locker?: string;
  duration?: number;
  price?: number;
}

export interface BookingResponse {
  id: number;
  date: number;
  service: {
    id: number;
    name: string;
    duration: number;
    price: number;
  };
  room: {
    id: number;
    name: string;
  };
  guest: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
  therapist?: {
    id: number;
    firstName?: string;
    lastName?: string;
  };
  confirmed: boolean;
  cancelled: boolean;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Room Types
export interface RoomRequest {
  name: string;
  description?: string;
  priority?: number;
  active?: boolean;
}

export interface RoomResponse {
  id: number;
  name: string;
  description?: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export interface ServiceRequest {
  categoryId: number;
  currencyId: number;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  preDuration?: number;
  postDuration?: number;
  space?: number;
  therapistType?: string;
  active?: boolean;
  roomType?: string;
  variableTime?: boolean;
  variablePrice?: boolean;
  minimalTime?: number;
  maximalTime?: number;
  timeUnit?: number;
}

export interface ServiceResponse {
  id: number;
  category: {
    id: number;
    name: string;
  };
  currency: {
    id: number;
    code: string;
    symbol: string;
  };
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Guest Types
export interface GuestRequest {
  firstName?: string;
  lastName?: string;
  attributes?: Array<{
    attributeId: number;
    value: string;
  }>;
}

export interface GuestResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  attributes: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Therapist Types
export interface TherapistRequest {
  firstName?: string;
  lastName?: string;
  priority?: number;
  attributes?: Array<{
    attributeId: number;
    value: string;
  }>;
  services?: number[];
}

export interface TherapistResponse {
  id: number;
  firstName?: string;
  lastName?: string;
  priority: number;
  attributes: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  services: Array<{
    id: number;
    name: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Filter Types
export interface BookingFilters extends PaginationQuery {
  dateFrom?: number;
  dateTo?: number;
  roomId?: number;
  serviceId?: number;
  therapistId?: number;
  guestId?: number;
  confirmed?: boolean;
  cancelled?: boolean;
}

export interface RoomFilters extends PaginationQuery {
  active?: boolean;
  serviceId?: number;
}

export interface ServiceFilters extends PaginationQuery {
  categoryId?: number;
  active?: boolean;
  therapistType?: string;
  roomType?: string;
}

export interface GuestFilters extends PaginationQuery {
  attributeId?: number;
  attributeValue?: string;
}

export interface TherapistFilters extends PaginationQuery {
  serviceId?: number;
  attributeId?: number;
  attributeValue?: string;
}
