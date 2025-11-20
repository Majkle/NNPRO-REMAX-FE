import api from './api';
import { Appointment, CreateAppointmentInput, PaginatedResponse } from '@/types';

const appointmentService = {
  /**
   * Fetch a paginated list of appointments.
   */
  getAppointments: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Appointment>> => {
    const response = await api.get<PaginatedResponse<Appointment>>(`/appointments?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Fetch a single appointment by its ID.
   */
  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Create a new appointment.
   */
  createAppointment: async (data: CreateAppointmentInput): Promise<Appointment> => {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  /**
   * Update an existing appointment.
   */
  updateAppointment: async (id: number, data: Partial<CreateAppointmentInput>): Promise<Appointment> => {
    const response = await api.put<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Delete an appointment by its ID.
   */
  deleteAppointment: async (id: number): Promise<void> => {
    await api.delete(`/appointments/${id}`);
  },
};

export default appointmentService;
