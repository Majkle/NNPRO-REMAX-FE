import api from './api';
import { Property, CreatePropertyInput, UpdatePropertyInput, PaginatedResponse, PropertyType, PropertyStatus, TransactionType, PriceHistory } from '@/types';

export interface PropertySearchParams {
  page?: number;
  limit?: number;
  type?: PropertyType;
  status?: PropertyStatus;
  contractType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  city?: string;
  searchTerm?: string;
  agentId?: number;
}

export interface PropertyStats {
  totalProperties: number;
  availableProperties: number;
  reservedProperties: number;
  soldProperties: number;
  totalValue: number;
  averagePrice: number;
}

const propertyService = {
  /**
   * Fetch a paginated list of properties.
   * @param page - The page number to fetch.
   * @param limit - The number of items per page.
   */
  getProperties: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedResponse<Property>>('/properties', {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Search and filter properties with advanced parameters.
   * @param params - Search and filter parameters.
   */
  searchProperties: async (params: PropertySearchParams): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedResponse<Property>>('/properties/search', { params });
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
   * Get properties by specific agent.
   * @param agentId - The ID of the agent.
   * @param page - The page number.
   * @param limit - Items per page.
   */
  getPropertiesByAgent: async (agentId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedResponse<Property>>(`/agents/${agentId}/properties`, {
      params: { page, limit }
    });
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
   * Partially update a property (PATCH).
   * @param id - The ID of the property to update.
   * @param data - The partial data to update.
   */
  patchProperty: async (id: number, data: Partial<UpdatePropertyInput>): Promise<Property> => {
    const response = await api.patch<Property>(`/properties/${id}`, data);
    return response.data;
  },

  /**
   * Update property status.
   * @param id - The ID of the property.
   * @param status - The new status.
   */
  updatePropertyStatus: async (id: number, status: PropertyStatus): Promise<Property> => {
    const response = await api.patch<Property>(`/properties/${id}/status`, { status });
    return response.data;
  },

  /**
   * Delete a property by its ID.
   * @param id - The ID of the property to delete.
   */
  deleteProperty: async (id: number): Promise<void> => {
    await api.delete(`/properties/${id}`);
  },

  /**
   * Upload images for a property.
   * @param propertyId - The ID of the property.
   * @param files - The image files to upload.
   * @param primaryImageIndex - Index of the primary image (optional).
   */
  uploadPropertyImages: async (propertyId: number, files: File[], primaryImageIndex?: number): Promise<Property> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
      if (index === primaryImageIndex) {
        formData.append('primaryImageIndex', index.toString());
      }
    });

    const response = await api.post<Property>(`/properties/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a property image.
   * @param propertyId - The ID of the property.
   * @param imageId - The ID of the image to delete.
   */
  deletePropertyImage: async (propertyId: number, imageId: number): Promise<void> => {
    await api.delete(`/properties/${propertyId}/images/${imageId}`);
  },

  /**
   * Set primary image for a property.
   * @param propertyId - The ID of the property.
   * @param imageId - The ID of the image to set as primary.
   */
  setPrimaryImage: async (propertyId: number, imageId: number): Promise<Property> => {
    const response = await api.patch<Property>(`/properties/${propertyId}/images/${imageId}/primary`);
    return response.data;
  },

  /**
   * Get property statistics (Admin).
   */
  getPropertyStats: async (): Promise<PropertyStats> => {
    const response = await api.get<PropertyStats>('/properties/stats');
    return response.data;
  },

  /**
   * Get featured/recommended properties.
   * @param limit - Number of properties to fetch.
   */
  getFeaturedProperties: async (limit: number = 6): Promise<Property[]> => {
    const response = await api.get<Property[]>('/properties/featured', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get recently added properties.
   * @param limit - Number of properties to fetch.
   */
  getRecentProperties: async (limit: number = 6): Promise<Property[]> => {
    const response = await api.get<Property[]>('/properties/recent', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Get price history for a property.
   * @param propertyId - The ID of the property.
   */
  getPriceHistory: async (propertyId: number): Promise<PriceHistory[]> => {
    const response = await api.get<PriceHistory[]>(`/properties/${propertyId}/price-history`);
    return response.data;
  },

  /**
   * Update property price (creates price history entry).
   * @param propertyId - The ID of the property.
   * @param newPrice - The new price.
   * @param reason - Optional reason for price change.
   */
  updatePropertyPrice: async (propertyId: number, newPrice: number, reason?: string): Promise<Property> => {
    const response = await api.patch<Property>(`/properties/${propertyId}/price`, {
      price: newPrice,
      reason
    });
    return response.data;
  },
};

export default propertyService;