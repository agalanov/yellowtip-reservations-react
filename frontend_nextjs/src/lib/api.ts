import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  Booking, 
  BookingRequest, 
  BookingFilters,
  Room,
  RoomRequest,
  RoomFilters,
  Service,
  ServiceRequest,
  ServiceFilters,
  Guest,
  GuestRequest,
  GuestFilters,
  Therapist,
  TherapistRequest,
  TherapistFilters,
  DashboardStats,
  ReservationData,
  ReservationFilters,
  QuickBooking,
  Role,
  RoleRequest,
  RoleFilters,
  AccessRight,
  AccessRightRequest,
  AccessRightFilters,
  Country,
  CountryRequest,
  CountryFilters,
  City,
  CityRequest,
  CityFilters,
  Language,
  LanguageRequest,
  LanguageFilters,
  Tax,
  TaxRequest,
  TaxFilters,
  WorkTimeDay,
  WorkTimeDate,
  OpeningHoursRequest
} from '@/types';

// Helper to get token from localStorage (client-side only)
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to redirect to login (client-side only)
const redirectToLogin = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            redirectToLogin();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data.data!;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async verifyToken(): Promise<{ user: any }> {
    const response = await this.api.get<ApiResponse<{ user: any }>>('/auth/verify');
    return response.data.data!;
  }

  // Booking endpoints
  async getBookings(filters?: BookingFilters): Promise<{ data: Booking[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Booking[]>>('/bookings', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getBooking(id: number): Promise<Booking> {
    const response = await this.api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data.data!;
  }

  async createBooking(booking: BookingRequest): Promise<Booking> {
    const response = await this.api.post<ApiResponse<Booking>>('/bookings', booking);
    return response.data.data!;
  }

  async updateBooking(id: number, booking: Partial<BookingRequest>): Promise<Booking> {
    const response = await this.api.put<ApiResponse<Booking>>(`/bookings/${id}`, booking);
    return response.data.data!;
  }

  async deleteBooking(id: number): Promise<void> {
    await this.api.delete(`/bookings/${id}`);
  }

  // Room endpoints
  async getRooms(filters?: RoomFilters): Promise<{ data: Room[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Room[]>>('/rooms', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getRoom(id: number): Promise<Room> {
    const response = await this.api.get<ApiResponse<Room>>(`/rooms/${id}`);
    return response.data.data!;
  }

  async createRoom(room: RoomRequest): Promise<Room> {
    const response = await this.api.post<ApiResponse<Room>>('/rooms', room);
    return response.data.data!;
  }

  async updateRoom(id: number, room: Partial<RoomRequest>): Promise<Room> {
    const response = await this.api.put<ApiResponse<Room>>(`/rooms/${id}`, room);
    return response.data.data!;
  }

  async deleteRoom(id: number): Promise<void> {
    await this.api.delete(`/rooms/${id}`);
  }

  async addServiceToRoom(roomId: number, serviceId: number): Promise<void> {
    await this.api.post(`/rooms/${roomId}/services`, { serviceId });
  }

  async removeServiceFromRoom(roomId: number, serviceId: number): Promise<void> {
    await this.api.delete(`/rooms/${roomId}/services/${serviceId}`);
  }

  // Service endpoints
  async getServices(filters?: ServiceFilters): Promise<{ data: Service[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Service[]>>('/services', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getService(id: number): Promise<Service> {
    const response = await this.api.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data.data!;
  }

  async createService(service: ServiceRequest): Promise<Service> {
    const response = await this.api.post<ApiResponse<Service>>('/services', service);
    return response.data.data!;
  }

  async updateService(id: number, service: Partial<ServiceRequest>): Promise<Service> {
    const response = await this.api.put<ApiResponse<Service>>(`/services/${id}`, service);
    return response.data.data!;
  }

  async deleteService(id: number): Promise<void> {
    await this.api.delete(`/services/${id}`);
  }

  // Guest endpoints
  async getGuests(filters?: GuestFilters): Promise<{ data: Guest[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Guest[]>>('/guests', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getGuest(id: number): Promise<Guest> {
    const response = await this.api.get<ApiResponse<Guest>>(`/guests/${id}`);
    return response.data.data!;
  }

  async createGuest(guest: GuestRequest): Promise<Guest> {
    const response = await this.api.post<ApiResponse<Guest>>('/guests', guest);
    return response.data.data!;
  }

  async updateGuest(id: number, guest: Partial<GuestRequest>): Promise<Guest> {
    const response = await this.api.put<ApiResponse<Guest>>(`/guests/${id}`, guest);
    return response.data.data!;
  }

  async deleteGuest(id: number): Promise<void> {
    await this.api.delete(`/guests/${id}`);
  }

  // Therapist endpoints
  async getTherapists(filters?: TherapistFilters): Promise<{ data: Therapist[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Therapist[]>>('/therapists', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getTherapist(id: number): Promise<Therapist> {
    const response = await this.api.get<ApiResponse<Therapist>>(`/therapists/${id}`);
    return response.data.data!;
  }

  async createTherapist(therapist: TherapistRequest): Promise<Therapist> {
    const response = await this.api.post<ApiResponse<Therapist>>('/therapists', therapist);
    return response.data.data!;
  }

  async updateTherapist(id: number, therapist: Partial<TherapistRequest>): Promise<Therapist> {
    const response = await this.api.put<ApiResponse<Therapist>>(`/therapists/${id}`, therapist);
    return response.data.data!;
  }

  async deleteTherapist(id: number): Promise<void> {
    await this.api.delete(`/therapists/${id}`);
  }

  // Admin endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.api.get<ApiResponse<DashboardStats>>('/admin/dashboard');
    return response.data.data!;
  }

  async getConfig(grouped?: boolean): Promise<Record<string, string> | Record<string, Array<{ name: string; value: string | null; app: string | null }>>> {
    const response = await this.api.get<ApiResponse<any>>('/admin/config', { params: grouped ? { grouped: 'true' } : {} });
    return response.data.data!;
  }

  async getConfigItem(name: string): Promise<{ name: string; value: string | null; app: string | null }> {
    const response = await this.api.get<ApiResponse<{ name: string; value: string | null; app: string | null }>>(`/admin/config/${name}`);
    return response.data.data!;
  }

  async updateConfig(config: Record<string, string>): Promise<void> {
    await this.api.put('/admin/config', { config });
  }

  async createConfigItem(name: string, value: string, app?: string): Promise<{ name: string; value: string | null; app: string | null }> {
    const response = await this.api.post<ApiResponse<{ name: string; value: string | null; app: string | null }>>('/admin/config', { name, value, app });
    return response.data.data!;
  }

  async updateConfigItem(name: string, value?: string, app?: string): Promise<{ name: string; value: string | null; app: string | null }> {
    const response = await this.api.put<ApiResponse<{ name: string; value: string | null; app: string | null }>>(`/admin/config/${name}`, { value, app });
    return response.data.data!;
  }

  async deleteConfigItem(name: string): Promise<void> {
    await this.api.delete(`/admin/config/${name}`);
  }

  async getUsers(filters?: any): Promise<{ data: any[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<any[]>>('/admin/users', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async createUser(user: any): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>('/admin/users', user);
    return response.data.data!;
  }

  async updateUser(id: number, user: any): Promise<any> {
    const response = await this.api.put<ApiResponse<any>>(`/admin/users/${id}`, user);
    return response.data.data!;
  }

  async deleteUser(id: number): Promise<void> {
    await this.api.delete(`/admin/users/${id}`);
  }

  // Categories endpoints
  async getCategories(filters?: { search?: string; page?: number; limit?: number }): Promise<{ data: any[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<any[]>>('/admin/categories', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getCategory(id: number): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>(`/admin/categories/${id}`);
    return response.data.data!;
  }

  async createCategory(category: any): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>('/admin/categories', category);
    return response.data.data!;
  }

  async updateCategory(id: number, category: any): Promise<any> {
    const response = await this.api.put<ApiResponse<any>>(`/admin/categories/${id}`, category);
    return response.data.data!;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.api.delete(`/admin/categories/${id}`);
  }

  // Currency endpoints
  async getCurrencies(filters?: { search?: string; page?: number; limit?: number }): Promise<{ data: any[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<any[]>>('/admin/currencies', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getCurrency(id: number): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>(`/admin/currencies/${id}`);
    return response.data.data!;
  }

  async createCurrency(currency: any): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>('/admin/currencies', currency);
    return response.data.data!;
  }

  async updateCurrency(id: number, currency: any): Promise<any> {
    const response = await this.api.put<ApiResponse<any>>(`/admin/currencies/${id}`, currency);
    return response.data.data!;
  }

  async deleteCurrency(id: number): Promise<void> {
    await this.api.delete(`/admin/currencies/${id}`);
  }

  // Colors endpoints
  async getColors(): Promise<any[]> {
    const response = await this.api.get<ApiResponse<any[]>>('/admin/colors');
    return response.data.data!;
  }

  // Reservation endpoints
  async getReservations(filters: ReservationFilters): Promise<ReservationData> {
    const response = await this.api.get<ApiResponse<ReservationData>>('/reservations', { params: filters });
    return response.data.data!;
  }

  async getQuickBookingOptions(): Promise<QuickBooking[]> {
    const response = await this.api.get<ApiResponse<QuickBooking[]>>('/reservations/quick-booking');
    return response.data.data!;
  }

  async getReservationOverview(filters: ReservationFilters): Promise<ReservationData> {
    const response = await this.api.get<ApiResponse<ReservationData>>('/reservations/overview', { params: filters });
    return response.data.data!;
  }

  async getRoomOverview(filters: ReservationFilters): Promise<{ rooms: Room[]; bookings: Booking[] }> {
    const response = await this.api.get<ApiResponse<{ rooms: Room[]; bookings: Booking[] }>>('/reservations/rooms', { params: filters });
    return response.data.data!;
  }

  async getTherapistOverview(filters: ReservationFilters): Promise<{ therapists: Therapist[]; bookings: Booking[] }> {
    const response = await this.api.get<ApiResponse<{ therapists: Therapist[]; bookings: Booking[] }>>('/reservations/therapists', { params: filters });
    return response.data.data!;
  }

  async getCalendarView(filters: ReservationFilters): Promise<{ bookings: Booking[] }> {
    const response = await this.api.get<ApiResponse<{ bookings: Booking[] }>>('/reservations/calendar', { params: filters });
    return response.data.data!;
  }

  // Roles endpoints
  async getRoles(filters?: RoleFilters): Promise<{ data: Role[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Role[]>>('/admin/roles', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getRole(id: number): Promise<Role> {
    const response = await this.api.get<ApiResponse<Role>>(`/admin/roles/${id}`);
    return response.data.data!;
  }

  async createRole(role: RoleRequest): Promise<Role> {
    const response = await this.api.post<ApiResponse<Role>>('/admin/roles', role);
    return response.data.data!;
  }

  async updateRole(id: number, role: Partial<RoleRequest>): Promise<Role> {
    const response = await this.api.put<ApiResponse<Role>>(`/admin/roles/${id}`, role);
    return response.data.data!;
  }

  async deleteRole(id: number): Promise<void> {
    await this.api.delete(`/admin/roles/${id}`);
  }

  // Access Rights endpoints
  async getAccessRights(filters?: AccessRightFilters): Promise<{ data: AccessRight[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<AccessRight[]>>('/admin/rights', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getAccessRight(id: number): Promise<AccessRight> {
    const response = await this.api.get<ApiResponse<AccessRight>>(`/admin/rights/${id}`);
    return response.data.data!;
  }

  async createAccessRight(right: AccessRightRequest): Promise<AccessRight> {
    const response = await this.api.post<ApiResponse<AccessRight>>('/admin/rights', right);
    return response.data.data!;
  }

  async updateAccessRight(id: number, right: Partial<AccessRightRequest>): Promise<AccessRight> {
    const response = await this.api.put<ApiResponse<AccessRight>>(`/admin/rights/${id}`, right);
    return response.data.data!;
  }

  async deleteAccessRight(id: number): Promise<void> {
    await this.api.delete(`/admin/rights/${id}`);
  }

  // Countries endpoints
  async getCountries(filters?: CountryFilters): Promise<{ data: Country[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Country[]>>('/admin/countries', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getCountry(id: number): Promise<Country> {
    const response = await this.api.get<ApiResponse<Country>>(`/admin/countries/${id}`);
    return response.data.data!;
  }

  async createCountry(country: CountryRequest): Promise<Country> {
    const response = await this.api.post<ApiResponse<Country>>('/admin/countries', country);
    return response.data.data!;
  }

  async updateCountry(id: number, country: Partial<CountryRequest>): Promise<Country> {
    const response = await this.api.put<ApiResponse<Country>>(`/admin/countries/${id}`, country);
    return response.data.data!;
  }

  async deleteCountry(id: number): Promise<void> {
    await this.api.delete(`/admin/countries/${id}`);
  }

  // Cities endpoints
  async getCities(filters?: CityFilters): Promise<{ data: City[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<City[]>>('/admin/cities', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getCity(id: number): Promise<City> {
    const response = await this.api.get<ApiResponse<City>>(`/admin/cities/${id}`);
    return response.data.data!;
  }

  async createCity(city: CityRequest): Promise<City> {
    const response = await this.api.post<ApiResponse<City>>('/admin/cities', city);
    return response.data.data!;
  }

  async updateCity(id: number, city: Partial<CityRequest>): Promise<City> {
    const response = await this.api.put<ApiResponse<City>>(`/admin/cities/${id}`, city);
    return response.data.data!;
  }

  async deleteCity(id: number): Promise<void> {
    await this.api.delete(`/admin/cities/${id}`);
  }

  // Languages endpoints
  async getLanguages(filters?: LanguageFilters): Promise<{ data: Language[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Language[]>>('/admin/languages', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getLanguage(id: string): Promise<Language> {
    const response = await this.api.get<ApiResponse<Language>>(`/admin/languages/${id}`);
    return response.data.data!;
  }

  async createLanguage(language: LanguageRequest): Promise<Language> {
    const response = await this.api.post<ApiResponse<Language>>('/admin/languages', language);
    return response.data.data!;
  }

  async updateLanguage(id: string, language: Partial<LanguageRequest>): Promise<Language> {
    const response = await this.api.put<ApiResponse<Language>>(`/admin/languages/${id}`, language);
    return response.data.data!;
  }

  async deleteLanguage(id: string): Promise<void> {
    await this.api.delete(`/admin/languages/${id}`);
  }

  // Taxes endpoints
  async getTaxes(filters?: TaxFilters): Promise<{ data: Tax[]; pagination?: any }> {
    const response = await this.api.get<ApiResponse<Tax[]>>('/admin/taxes', { params: filters });
    return {
      data: response.data.data!,
      pagination: response.data.pagination,
    };
  }

  async getTax(id: number): Promise<Tax> {
    const response = await this.api.get<ApiResponse<Tax>>(`/admin/taxes/${id}`);
    return response.data.data!;
  }

  async createTax(tax: TaxRequest): Promise<Tax> {
    const response = await this.api.post<ApiResponse<Tax>>('/admin/taxes', tax);
    return response.data.data!;
  }

  async updateTax(id: number, tax: Partial<TaxRequest>): Promise<Tax> {
    const response = await this.api.put<ApiResponse<Tax>>(`/admin/taxes/${id}`, tax);
    return response.data.data!;
  }

  async deleteTax(id: number): Promise<void> {
    await this.api.delete(`/admin/taxes/${id}`);
  }

  // Opening Hours endpoints
  async getOpeningHours(): Promise<WorkTimeDay[]> {
    const response = await this.api.get<ApiResponse<WorkTimeDay[]>>('/admin/opening-hours');
    return response.data.data!;
  }

  async updateOpeningHours(days: OpeningHoursRequest['days']): Promise<WorkTimeDay[]> {
    const response = await this.api.put<ApiResponse<WorkTimeDay[]>>('/admin/opening-hours', { days });
    return response.data.data!;
  }

  async getOpeningHoursDates(startDate?: number, endDate?: number): Promise<WorkTimeDate[]> {
    const response = await this.api.get<ApiResponse<WorkTimeDate[]>>('/admin/opening-hours/dates', {
      params: { startDate, endDate },
    });
    return response.data.data!;
  }
}

export const apiService = new ApiService();
export default apiService;




