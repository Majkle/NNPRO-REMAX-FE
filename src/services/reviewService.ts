import api from './api';
import { Review, CreateReviewInput, PaginatedResponse } from '@/types';

const reviewService = {
  /**
   * Fetch reviews for a specific property or agent.
   * @param propertyId - Optional ID of the property to fetch reviews for.
   * @param agentId - Optional ID of the agent to fetch reviews for.
   */
  getReviews: async (params: { propertyId?: number; agentId?: number; page?: number; limit?: number }): Promise<PaginatedResponse<Review>> => {
    const response = await api.get<PaginatedResponse<Review>>('/reviews', { params });
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
   * Delete a review by its ID.
   * @param id - The ID of the review to delete.
   */
  deleteReview: async (id: number): Promise<void> => {
    await api.delete(`/reviews/${id}`);
  },
};

export default reviewService;
