import api from './api';
import { User, UserRole, AddressRegion } from '@/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: User;
  role: string;
}

export interface RegisterRequest {
  username: string,
  email: string,
  password: string,
  degree: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  birthDate: Date,
  street: string,
  city: string,
  postalCode: string,
  country: string,
  region: AddressRegion,
  flatNumber?: string
}

export interface ProfileUpdateRequest {
  email: string,
  degree: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  birthDate: Date,
  street: string,
  city: string,
  postalNumber: string,
  country: string,
  region: AddressRegion,
  flatNumber?: string
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

const authService = {
  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Logout user (optional backend call to invalidate token)
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore errors, just clear local storage
      console.error('Logout error:', error);
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post('/auth/reset-password', data);
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post('/auth/change-password', data);
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await api.patch<User>('/profile', data);
    return response.data;
  },

  /**
   * Refresh JWT token
   */
  refreshToken: async (): Promise<string> => {
    const response = await api.post<{ token: string }>('/auth/refresh');
    return response.data.token;
  },

  /**
   * Get all users (Admin)
   */
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },

  /**
   * Delete a user (Admin)
   */
  deleteUser: async (username: string): Promise<void> => {
    await api.delete(`/admin/users/${username}`);
  },

  /**
   * Update user status (Admin)
   */
  updateUserStatus: async (userId: number, isBlocked: boolean): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}`, { isBlocked });
    return response.data;
  },

  /**
   * Update a user's information (Admin)
   */
  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete current user's profile
   */
  deleteProfile: async (): Promise<void> => {
    await api.delete('/profile');
  },
};

export default authService;
