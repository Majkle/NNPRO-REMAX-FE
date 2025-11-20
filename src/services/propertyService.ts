import api from './api';
import { Property, CreatePropertyInput, UpdatePropertyInput, PaginatedResponse } from '@/types';

const propertyService = {
  /**
   * Fetch a paginated list of properties.
   * @param page - The page number to fetch.
   * @param limit - The number of items per page.
   */
  getProperties: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Property>> => {
    // Correct endpoint might be '/properties' or '/real-estates'
    const response = await api.get<PaginatedResponse<Property>>(`/properties?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Fetch a single property by its ID.
   * @param id - The ID of the property to fetch.
   */
  getProperty: async (id: number): Promise<Property> => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  /**
   * Create a new property.
   * @param data - The data for the new property.
   */
  createProperty: async (data: CreatePropertyInput): Promise<Property> => {
    const response = await api.post<Property>('/properties', data);
    return response.data;
  },

  /**
   * Update an existing property.
   * @param id - The ID of the property to update.
   * @param data - The data to update.
   */
  updateProperty: async (id: number, data: UpdatePropertyInput): Promise<Property> => {
    const response = await api.put<Property>(`/properties/${id}`, data);
    return response.data;
  },

  /**
   * Delete a property by its ID.
   * @param id - The ID of the property to delete.
   */
  deleteProperty: async (id: number): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },
};

export default propertyService;
