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

export interface CreateUserRequest {
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
  flatNumber?: string,
}

export interface UpdateUserRequest {
  email: string,
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
  postalCode: string,
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
    await api.post('/auth/password-reset/request', data);
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
   * Get a specific user profile
   */
  getSpecificProfile: async (userId: number): Promise<User> => {
    const response = await api.get<User>(`/profile/${userId}`);
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
   * Block a user indefinitely (Admin)
   */
  blockUser: async (username: string): Promise<void> => {
    await api.post(`/admin/block/${username}`, {});
  },

  /**
   * Unblock a user indefinitely (Admin)
   */
  unblockUser: async (username: string): Promise<void> => {
    await api.post(`/admin/unblock/${username}`, {});
  },

  /**
   * Update user status (Admin)
   */
  updateUserStatus: async (userId: number, isBlocked: boolean): Promise<User> => {
    const response = await api.patch<User>(`/users/${userId}`, { isBlocked });
    return response.data;
  },

  /**
   * Create a new user (Admin)
   */
  createUser: async (role: UserRole, data: CreateUserRequest): Promise<User> => {
    if (role === UserRole.AGENT) {
      const response = await api.post<User>(`/admin/realtors`, {
        ...data,
        licenseNumber: 10000 + Math.floor(Math.random() * 89999),
        about:''
      });
      return {...response.data, role: UserRole.AGENT};
    } else if (role === UserRole.ADMIN) {
      const response = await api.post<User>(`/admin/admins`, data);
      return {...response.data, role: UserRole.ADMIN};
    } else {
      throw new Error('User must not be a client!');
    }
  },

  /**
   * Update a user's information (Admin)
   */
  updateUser: async (username: string, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put<User>(`/admin/users/${username}`, data);
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
