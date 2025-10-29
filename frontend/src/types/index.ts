// API Response Types
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
export interface User {
  id: number;
  loginId: string;
  firstName?: string;
  lastName?: string;
  status: string;
}

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Booking Types
export interface Booking {
  id: number;
  date: number;
  time: number;
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

// Room Types
export interface Room {
  id: number;
  name: string;
  description?: string;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  services?: Array<{
    service: {
      id: number;
      name: string;
      duration: number;
      price: number;
    };
  }>;
  bookings?: Array<{
    id: number;
    date: number;
    time: number;
    duration: number;
    guest: {
      id: number;
      firstName?: string;
      lastName?: string;
    };
    service: {
      id: number;
      name: string;
    };
  }>;
}

export interface RoomRequest {
  name: string;
  description?: string;
  priority?: number;
  active?: boolean;
}

// Service Types
export interface Service {
  id: number;
  category: {
    id: number;
    name: string;
    hexcode?: string;
    textcolor?: string;
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
  rooms?: Array<{
    room: {
      id: number;
      name: string;
    };
  }>;
}

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

// Guest Types
export interface Guest {
  id: number;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  attributes?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  bookings?: Array<{
    id: number;
    date: number;
    time: number;
    service: {
      id: number;
      name: string;
    };
    room: {
      id: number;
      name: string;
    };
    therapist?: {
      id: number;
      firstName?: string;
      lastName?: string;
    };
  }>;
}

export interface GuestRequest {
  firstName?: string;
  lastName?: string;
  attributes?: Array<{
    attributeId: number;
    value: string;
  }>;
}

// Therapist Types
export interface Therapist {
  id: number;
  firstName?: string;
  lastName?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  attributes?: Array<{
    id: number;
    name: string;
    value: string;
  }>;
  services?: Array<{
    id: number;
    name: string;
  }>;
  bookings?: Array<{
    id: number;
    date: number;
    time: number;
    service: {
      id: number;
      name: string;
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
  }>;
}

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

// Dashboard Types
export interface DashboardStats {
  todayBookings: number;
  totalActiveBookings: number;
  totalGuests: number;
  totalTherapists: number;
  totalRooms: number;
  totalServices: number;
  recentBookings: Array<{
    id: number;
    date: number;
    time: number;
    service: {
      name: string;
    };
    room: {
      name: string;
    };
    guest: {
      firstName?: string;
      lastName?: string;
    };
    therapist?: {
      firstName?: string;
      lastName?: string;
    };
  }>;
}

// Reservation Types
export interface ReservationData {
  bookings: Booking[];
  rooms: Room[];
  therapists: Therapist[];
  services: Service[];
  quickBookings: QuickBooking[];
}

export interface QuickBooking {
  id: number;
  name: string;
  service: {
    id: number;
    name: string;
    duration: number;
    price: number;
  };
  category: {
    id: number;
    name: string;
    hexcode: string;
    textcolor: string;
  };
}

// Filter Types
export interface BookingFilters {
  page?: number;
  limit?: number;
  dateFrom?: number;
  dateTo?: number;
  roomId?: number;
  serviceId?: number;
  therapistId?: number;
  guestId?: number;
  confirmed?: boolean;
  cancelled?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReservationFilters {
  date?: string;
  viewMode?: 'day' | 'week' | 'month';
  roomId?: number;
  therapistId?: number;
  serviceId?: number;
}

export interface RoomFilters {
  page?: number;
  limit?: number;
  active?: boolean;
  serviceId?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceFilters {
  page?: number;
  limit?: number;
  categoryId?: number;
  active?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GuestFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TherapistFilters {
  page?: number;
  limit?: number;
  serviceId?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  required?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

// Navigation Types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType;
  children?: NavItem[];
}

// Theme Types
export interface Theme {
  palette: {
    primary: {
      main: string;
      light: string;
      dark: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
    };
    background: {
      default: string;
      paper: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
  typography: {
    fontFamily: string;
    h1: {
      fontSize: string;
      fontWeight: number;
    };
    h2: {
      fontSize: string;
      fontWeight: number;
    };
    h3: {
      fontSize: string;
      fontWeight: number;
    };
    h4: {
      fontSize: string;
      fontWeight: number;
    };
    h5: {
      fontSize: string;
      fontWeight: number;
    };
    h6: {
      fontSize: string;
      fontWeight: number;
    };
  };
}
