import api from './api';
import { Property, PropertyImage, CreateApartmentAPI, CreateHouseAPI, CreateLandAPI,
  UpdateApartmentAPI, UpdateHouseAPI, UpdateLandAPI,
  UpdatePropertyInput, PaginatedResponse,
  PropertyType, PropertyStatus, TransactionType, PriceHistory } from '@/types';
import imageService from './imageService';

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

// Type for API response where images are just IDs and may have realtorId instead of agentId
type PropertyAPIResponse = Omit<Property, 'images' | 'agentId'> & {
  images: number[] | PropertyImage[];
  agentId?: number;
  realtorId?: number;
};

/**
 * Transform image IDs to PropertyImage objects with URLs and normalize field names
 */
const transformPropertyImages = (property: PropertyAPIResponse): Property => {
  // Normalize realtorId to agentId
  const agentId = property.agentId ?? property.realtorId;

  // If no images or already PropertyImage objects, return as-is
  if (!property.images || property.images.length === 0) {
    return { ...property, agentId, images: [] } as unknown as Property;
  }

  if (typeof property.images[0] === 'object') {
    return { ...property, agentId } as unknown as Property;
  }

  // Transform image IDs to PropertyImage objects
  const imageIds = property.images as number[];
  const transformedImages: PropertyImage[] = imageIds.map((id, index) => ({
    id,
    url: imageService.getImageUrl(id),
    isPrimary: index === 0, // First image is primary by default
    propertyId: property.id,
  }));

  return {
    ...property,
    agentId,
    images: transformedImages,
  } as unknown as Property;
};

/**
 * Transform array of properties
 */
const transformPropertiesArray = (properties: PropertyAPIResponse[]): Property[] => {
  return properties.map(transformPropertyImages);
};

/**
 * Transform paginated response
 */
const transformPaginatedResponse = (response: PaginatedResponse<PropertyAPIResponse>): PaginatedResponse<Property> => {
  return {
    ...response,
    content: transformPropertiesArray(response.content),
  };
};

const propertyService = {
  /**
   * Fetch a paginated list of properties.
   * @param page - The page number to fetch.
   * @param limit - The number of items per page.
   */
  getProperties: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedResponse<PropertyAPIResponse>>('/real-estates', {
      params: { page, limit }
    });
    return transformPaginatedResponse(response.data);
  },

  /**
   * Search and filter properties with advanced parameters.
   * @param params - Search and filter parameters.
   */
  searchProperties: async (params: PropertySearchParams): Promise<PaginatedResponse<Property>> => {
    const response = await api.get<PaginatedResponse<PropertyAPIResponse>>('/real-estates', { params });
    return transformPaginatedResponse(response.data);
  },

  /**
   * Fetch a single property by its ID.
   * @param id - The ID of the property to fetch.
   */
  getProperty: async (id: number): Promise<Property> => {
    const response = await api.get<PropertyAPIResponse>(`/real-estates/${id}`);
    return transformPropertyImages(response.data);
  },

  /**
   * Get properties by specific agent.
   * @param agentId - The ID of the agent.
   */
  getPropertiesByAgent: async (agentId: number): Promise<Property[]> => {
    const response = await api.get<PropertyAPIResponse[]>(`/real-estates/by-realtor/${agentId}`);
    return transformPropertiesArray(response.data);
  },

  /**
   * Create a new apartment.
   * @param data - The data for the new property.
   */
  createApartment: async (data: CreateApartmentAPI): Promise<Property> => {
    const response = await api.post<PropertyAPIResponse>('/real-estates', data);
    return transformPropertyImages(response.data);
  },

  /**
   * Create a new house.
   * @param data - The data for the new property.
   */
  createHouse: async (data: CreateHouseAPI): Promise<Property> => {
    const response = await api.post<PropertyAPIResponse>('/real-estates', data);
    return transformPropertyImages(response.data);
  },

  /**
   * Create a new land.
   * @param data - The data for the new property.
   */
  createLand: async (data: CreateLandAPI): Promise<Property> => {
    const response = await api.post<PropertyAPIResponse>('/real-estates', data);
    return transformPropertyImages(response.data);
  },

  /**
   * Update apartment.
   * @param id - The ID of the property to update.
   * @param data - The data for the new property.
   */
  updateApartment: async (id: number, data: UpdateApartmentAPI): Promise<Property> => {
    const response = await api.put<PropertyAPIResponse>('/real-estates', data);
    return transformPropertyImages(response.data);
  },

  /**
   * Update house.
   * @param id - The ID of the property to update.
   * @param data - The data for the new property.
   */
  updateHouse: async (id: number, data: UpdateHouseAPI): Promise<Property> => {
    const response = await api.put<PropertyAPIResponse>(`/real-estates/${id}`, data);
    return transformPropertyImages(response.data);
  },

  /**
   * Update land.
   * @param id - The ID of the property to update.
   * @param data - The data for the new property.
   */
  updateLand: async (id: number, data: UpdateLandAPI): Promise<Property> => {
    const response = await api.put<PropertyAPIResponse>(`/real-estates/${id}`, data);
    return transformPropertyImages(response.data);
  },

  /**
   * Update an existing property.
   * @param id - The ID of the property to update.
   * @param data - The data to update.
   */
  updateProperty: async (id: number, data: UpdatePropertyInput): Promise<Property> => {
    const response = await api.put<PropertyAPIResponse>(`/real-estates/${id}`, data);
    return transformPropertyImages(response.data);
  },

  /**
   * Partially update a property (PATCH).
   * @param id - The ID of the property to update.
   * @param data - The partial data to update.
   */
  patchProperty: async (id: number, data: Partial<UpdatePropertyInput>): Promise<Property> => {
    const response = await api.patch<PropertyAPIResponse>(`/real-estates/${id}`, data);
    return transformPropertyImages(response.data);
  },

  /**
   * Update property status.
   * @param id - The ID of the property.
   * @param status - The new status.
   */
  updatePropertyStatus: async (id: number, status: PropertyStatus): Promise<Property> => {
    const response = await api.patch<PropertyAPIResponse>(`/real-estates/${id}/status`, { status });
    return transformPropertyImages(response.data);
  },

  /**
   * Delete a property by its ID.
   * @param id - The ID of the property to delete.
   */
  deleteProperty: async (id: number): Promise<void> => {
    await api.delete(`/real-estates/${id}`);
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

    const response = await api.post<PropertyAPIResponse>(`/real-estates/${propertyId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return transformPropertyImages(response.data);
  },

  /**
   * Delete a property image.
   * @param propertyId - The ID of the property.
   * @param imageId - The ID of the image to delete.
   */
  deletePropertyImage: async (propertyId: number, imageId: number): Promise<void> => {
    await api.delete(`/real-estates/${propertyId}/images/${imageId}`);
  },

  /**
   * Set primary image for a property.
   * @param propertyId - The ID of the property.
   * @param imageId - The ID of the image to set as primary.
   */
  setPrimaryImage: async (propertyId: number, imageId: number): Promise<Property> => {
    const response = await api.patch<PropertyAPIResponse>(`/real-estates/${propertyId}/images/${imageId}/primary`);
    return transformPropertyImages(response.data);
  },

  /**
   * Get property statistics (Admin).
   */
  getPropertyStats: async (): Promise<PropertyStats> => {
    const response = await api.get<PropertyStats>('/real-estates/stats');
    return response.data;
  },

  /**
   * Get featured/recommended properties.
   * @param limit - Number of properties to fetch.
   */
  getFeaturedProperties: async (limit: number = 6): Promise<Property[]> => {
    const response = await api.get<PropertyAPIResponse[]>('/real-estates/featured', {
      params: { limit }
    });
    return transformPropertiesArray(response.data);
  },

  /**
   * Get recently added properties.
   * @param limit - Number of properties to fetch.
   */
  getRecentProperties: async (limit: number = 6): Promise<Property[]> => {
    const response = await api.get<PropertyAPIResponse[]>('/real-estates/recent', {
      params: { limit }
    });
    return transformPropertiesArray(response.data);
  },

  /**
   * Get price history for a property.
   * @param propertyId - The ID of the property.
   */
  getPriceHistory: async (propertyId: number): Promise<PriceHistory[]> => {
    const response = await api.get<PriceHistory[]>(`/real-estates/${propertyId}/price-history`);
    return response.data;
  },

  /**
   * Update property price (creates price history entry).
   * @param propertyId - The ID of the property.
   * @param newPrice - The new price.
   * @param reason - Optional reason for price change.
   */
  updatePropertyPrice: async (propertyId: number, newPrice: number, reason?: string): Promise<Property> => {
    const response = await api.patch<PropertyAPIResponse>(`/real-estates/${propertyId}/price`, {
      price: newPrice,
      reason
    });
    return transformPropertyImages(response.data);
  },
};

export default propertyService;