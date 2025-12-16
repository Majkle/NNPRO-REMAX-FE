import api from './api';
import { Review, CreateReviewInput, PaginatedResponse, SimplifiedUser } from '@/types';

export interface ReviewSearchParams {
  propertyId?: number;
  agentId?: number;
  authorId?: number;
  minRating?: number;
  maxRating?: number;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface AgentRatingStats {
  agentId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

const reviewService = {
  /**
   * Fetch reviews with filtering and pagination.
   * @param params - Search and filter parameters.
   */
  getReviews: async (params: ReviewSearchParams): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<PaginatedResponse<Review>>('/reviews', { params });
    return response.data;
  },

  /**
   * Fetch all reviews.
   */
  getAllReviews: async (): Promise<Review[]> => {
    const response = await api.get<Review[]>('/reviews', {});
    return response.data;
  },

  /**
   * Fetch all agents.
   */
  getAllAgents: async (): Promise<SimplifiedUser[]> => {
    const response = await api.get<SimplifiedUser[]>('/reviews/realtors');
    return response.data;
  },

  /**
   * Get a single review by ID.
   * @param id - The ID of the review.
   */
  getReview: async (id: number): Promise<Review> => {
    const response = await api.get<Review>(`/reviews/${id}`);
    return response.data;
  },

  /**
   * Get reviews for a specific agent.
   * @param agentId - The ID of the agent.
   */
  getAgentReviews: async (agentId: number): Promise<Review[]> => {
    const response = await api.get<Review[]>(`/reviews/realtor/${agentId}`);
    return response.data;
  },

  /**
   * Get reviews for a specific agent.
   * @param agentId - The ID of the agent.
   * @param page - Page number.
   * @param limit - Items per page.
   */
  getPaginatedAgentReviews: async (agentId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<PaginatedResponse<Review>>(`/agents/${agentId}/reviews`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get reviews for a specific property.
   * @param propertyId - The ID of the property.
   * @param page - Page number.
   * @param limit - Items per page.
   */
  getPaginatedPropertyReviews: async (propertyId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<PaginatedResponse<Review>>(`/properties/${propertyId}/reviews`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Get agent rating statistics.
   * @param agentId - The ID of the agent.
   */
  getAgentRatingStats: async (agentId: number): Promise<AgentRatingStats> => {
    const response = await api.get<AgentRatingStats>(`/agents/${agentId}/rating-stats`);
    return response.data;
  },

  /**
   * Get recent reviews across the platform.
   * @param limit - Number of reviews to fetch.
   */
  getRecentReviews: async (limit: number = 10): Promise<Review[]> => {
    const response = await api.get<Review[]>('/reviews/recent', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * Create a new review.
   * @param data - The data for the new review.
   */
  createReview: async (data: CreateReviewInput): Promise<Review> => {
    const response = await api.post<Review>('/reviews', data);
    return response.data;
  },

  /**
   * Update an existing review.
   * @param id - The ID of the review to update.
   * @param data - The updated review data.
   */
  updateReview: async (id: number, data: Partial<CreateReviewInput>): Promise<Review> => {
    const response = await api.put<Review>(`/reviews/${id}`, data);
    return response.data;
  },

  /**
   * Delete a review by its ID.
   * @param id - The ID of the review to delete.
   */
  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },

  /**
   * Check if user can review a specific agent.
   * @param agentId - The ID of the agent.
   */
  canReviewAgent: async (agentId: number): Promise<{ canReview: boolean; reason?: string }> => {
    const response = await api.get<{ canReview: boolean; reason?: string }>(`/agents/${agentId}/can-review`);
    return response.data;
  },

  /**
   * Report a review as inappropriate (Admin).
   * @param id - The ID of the review to report.
   * @param reason - The reason for reporting.
   */
  reportReview: async (id: number, reason: string): Promise<void> => {
    await api.post(`/reviews/${id}/report`, { reason });
  },
};

export default reviewService;