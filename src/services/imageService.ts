import api from './api';

export interface ImageUploadResponse {
  id: number;
  filename: string;
  contentType: string;
  size: number;
  downloadUrl: string;
}

const imageService = {
  uploadImage: async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ImageUploadResponse>('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadImages: async (files: File[]): Promise<ImageUploadResponse[]> => {
    const uploadPromises = files.map(file => imageService.uploadImage(file));
    return Promise.all(uploadPromises);
  },

  deleteImage: async (id: number): Promise<void> => {
    await api.delete(`/images/${id}`);
  },

  getImageUrl: (id: number): string => {
    return `${api.defaults.baseURL}/images/${id}`;
  },
};

export default imageService;
