import api from './api';
import { Appointment, CreateAppointmentInput, PaginatedResponse, AppointmentStatus, AppointmentType } from '@/types';

export interface AppointmentSearchParams {
  page?: number;
  limit?: number;
  agentId?: number;
  clientId?: number;
  propertyId?: number;
  status?: AppointmentStatus;
  type?: AppointmentType;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
  sortBy?: 'startTime' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentStats {
  totalAppointments: number;
  scheduledAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
}

const appointmentService = {
  /**
   * Fetch appointments with filtering and pagination.
   * @param params - Search and filter parameters.
   */
  getAppointments: async (params: AppointmentSearchParams = {}): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get<PaginatedResponse<Appointment>>('/appointments', { params });
    return response.data;
  },

  /**
   * Fetch a single appointment by its ID.
   * @param id - The ID of the appointment.
   */
  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Get appointments for a specific agent.
   * @param agentId - The ID of the agent.
   * @param params - Additional filter parameters.
   */
  getAppointmentsByAgent: async (agentId: number, params: Omit<AppointmentSearchParams, 'agentId'> = {}): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get<PaginatedResponse<Appointment>>(`/agents/${agentId}/appointments`, { params });
    return response.data;
  },

  /**
   * Get appointments for a specific client.
   * @param clientId - The ID of the client.
   * @param params - Additional filter parameters.
   */
  getAppointmentsByClient: async (clientId: number, params: Omit<AppointmentSearchParams, 'clientId'> = {}): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get<PaginatedResponse<Appointment>>(`/clients/${clientId}/appointments`, { params });
    return response.data;
  },

  /**
   * Get appointments for a specific property.
   * @param propertyId - The ID of the property.
   * @param params - Additional filter parameters.
   */
  getAppointmentsByProperty: async (propertyId: number, params: Omit<AppointmentSearchParams, 'propertyId'> = {}): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get<PaginatedResponse<Appointment>>(`/properties/${propertyId}/appointments`, { params });
    return response.data;
  },

  /**
   * Get appointments within a date range.
   * @param startDate - Start date (ISO string).
   * @param endDate - End date (ISO string).
   * @param params - Additional filter parameters.
   */
  getAppointmentsByDateRange: async (startDate: string, endDate: string, params: Omit<AppointmentSearchParams, 'startDate' | 'endDate'> = {}): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get<PaginatedResponse<Appointment>>('/appointments/date-range', {
      params: { ...params, startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get today's appointments for the current user.
   */
  getTodayAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments/today');
    return response.data;
  },

  /**
   * Get upcoming appointments for the current user.
   * @param limit - Maximum number of appointments to return.
   */
  getUpcomingAppointments: async (limit: number = 10): Promise<Appointment[]> => {
    const response = await api.get<Appointment[]>('/appointments/upcoming', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get appointment statistics.
   * @param agentId - Optional agent ID to filter stats.
   */
  getAppointmentStats: async (agentId?: number): Promise<AppointmentStats> => {
    const response = await api.get<AppointmentStats>('/appointments/stats', {
      params: agentId ? { agentId } : {}
    });
    return response.data;
  },

  /**
   * Create a new appointment.
   * @param data - The appointment data.
   */
  createAppointment: async (data: CreateAppointmentInput): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  /**
   * Update an existing appointment.
   * @param id - The ID of the appointment.
   * @param data - The updated appointment data.
   */
  updateAppointment: async (id: number, data: Partial<CreateAppointmentInput>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Update appointment status.
   * @param id - The ID of the appointment.
   * @param status - The new status.
   */
  updateAppointmentStatus: async (id: number, status: AppointmentStatus): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/status`, { status });
    return response.data;
  },

  /**
   * Confirm an appointment (agent).
   * @param id - The ID of the appointment.
   */
  confirmAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.post<Appointment>(`/appointments/${id}/confirm`);
    return response.data;
  },

  /**
   * Cancel an appointment.
   * @param id - The ID of the appointment.
   * @param reason - Optional cancellation reason.
   */
  cancelAppointment: async (id: number, reason?: string): Promise<Appointment> => {
    const response = await api.post<Appointment>(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Mark an appointment as completed.
   * @param id - The ID of the appointment.
   * @param notes - Optional completion notes.
   */
  completeAppointment: async (id: number, notes?: string): Promise<Appointment> => {
    const response = await api.post<Appointment>(`/appointments/${id}/complete`, { notes });
    return response.data;
  },

  /**
   * Reschedule an appointment.
   * @param id - The ID of the appointment.
   * @param startTime - New start time (ISO string).
   * @param endTime - New end time (ISO string).
   */
  rescheduleAppointment: async (id: number, startTime: string, endTime: string): Promise<Appointment> => {
    const response = await api.patch<Appointment>(`/appointments/${id}/reschedule`, { startTime, endTime });
    return response.data;
  },

  /**
   * Check agent availability for a specific time slot.
   * @param agentId - The ID of the agent.
   * @param startTime - Start time to check (ISO string).
   * @param endTime - End time to check (ISO string).
   */
  checkAgentAvailability: async (agentId: number, startTime: string, endTime: string): Promise<{ available: boolean; conflictingAppointments?: Appointment[] }> => {
    const response = await api.get<{ available: boolean; conflictingAppointments?: Appointment[] }>(`/agents/${agentId}/availability`, {
      params: { startTime, endTime }
    });
    return response.data;
  },

  /**
   * Delete an appointment by its ID.
   * @param id - The ID of the appointment.
   */
  deleteAppointment: async (id: number): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },
};

export default appointmentService;