import api from './api';
import { User, PaginatedResponse, UserRole } from '@/types';

export interface UserSearchParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  isBlocked?: boolean;
  searchTerm?: string;
  sortBy?: 'createdAt' | 'lastName' | 'email';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  totalUsers: number;
  totalClients: number;
  totalAgents: number;
  totalAdmins: number;
  blockedUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export interface AgentProfile extends User {
  bio?: string;
  specializations?: string[];
  yearsOfExperience?: number;
  languages?: string[];
  licenseNumber?: string;
  officeAddress?: string;
  propertiesCount?: number;
  averageRating?: number;
  totalReviews?: number;
}

const userService = {
  /**
   * Get all users with filtering and pagination (Admin).
   * @param params - Search and filter parameters.
   */
  getUsers: async (params: UserSearchParams = {}): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  /**
   * Get a single user by ID.
   * @param id - The ID of the user.
   */
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Get user profile by ID (public endpoint).
   * @param id - The ID of the user.
   */
  getUserProfile: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/profile/${id}`);
    return response.data;
  },

  /**
   * Get all agents (for dropdown/selection purposes).
   * @param page - Page number.
   * @param limit - Items per page.
   */
  getAgents: async (page: number = 1, limit: number = 100): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>('/agents', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get agent profile with additional details.
   * @param id - The ID of the agent.
   */
  getAgentProfile: async (id: number): Promise<AgentProfile> => {
    const response = await api.get<AgentProfile>(`/agents/${id}/profile`);
    return response.data;
  },

  /**
   * Get top-rated agents.
   * @param limit - Number of agents to return.
   */
  getTopAgents: async (limit: number = 10): Promise<AgentProfile[]> => {
    const response = await api.get<AgentProfile[]>('/agents/top-rated', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Update agent profile information.
   * @param id - The ID of the agent.
   * @param data - The profile data to update.
   */
  updateAgentProfile: async (id: number, data: Partial<AgentProfile>): Promise<AgentProfile> => {
    const response = await api.put<AgentProfile>(`/agents/${id}/profile`, data);
    return response.data;
  },

  /**
   * Update a user's information (Admin).
   * @param id - The ID of the user.
   * @param data - The user data to update.
   */
  updateUser: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Block or unblock a user (Admin).
   * @param id - The ID of the user.
   * @param isBlocked - Whether to block or unblock the user.
   */
  updateUserStatus: async (id: number, isBlocked: boolean): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/status`, { isBlocked });
    return response.data;
  },

  /**
   * Update user role (Admin).
   * @param id - The ID of the user.
   * @param role - The new role.
   */
  updateUserRole: async (id: number, role: UserRole): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}/role`, { role });
    return response.data;
  },

  /**
   * Delete a user (Admin).
   * @param id - The ID of the user to delete.
   */
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  /**
   * Get user statistics (Admin).
   */
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/users/stats');
    return response.data;
  },

  /**
   * Search users by name or email.
   * @param searchTerm - The search term.
   * @param limit - Maximum number of results.
   */
  searchUsers: async (searchTerm: string, limit: number = 20): Promise<User[]> => {
    const response = await api.get<User[]>('/users/search', {
      params: { q: searchTerm, limit }
    });
    return response.data;
  },

  /**
   * Upload user avatar/profile picture.
   * @param userId - The ID of the user.
   * @param file - The image file to upload.
   */
  uploadAvatar: async (userId: number, file: File): Promise<User> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post<User>(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete user avatar.
   * @param userId - The ID of the user.
   */
  deleteAvatar: async (userId: number): Promise<User> => {
    const response = await api.delete<User>(`/users/${userId}/avatar`);
    return response.data;
  },

  /**
   * Get user activity log (Admin).
   * @param userId - The ID of the user.
   * @param page - Page number.
   * @param limit - Items per page.
   */
  getUserActivityLog: async (userId: number, page: number = 1, limit: number = 50): Promise<PaginatedResponse<any>> => {
    const response = await api.get<PaginatedResponse<any>>(`/users/${userId}/activity`, {
      params: { page, limit }
    });
    return response.data;
  },
};

export default userService;
