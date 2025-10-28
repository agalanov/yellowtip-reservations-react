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
  DashboardStats
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
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
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
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

  async getConfig(): Promise<Record<string, string>> {
    const response = await this.api.get<ApiResponse<Record<string, string>>>('/admin/config');
    return response.data.data!;
  }

  async updateConfig(config: Record<string, string>): Promise<void> {
    await this.api.put('/admin/config', { config });
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
}

export const apiService = new ApiService();
export default apiService;
