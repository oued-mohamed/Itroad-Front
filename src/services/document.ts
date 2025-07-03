// ===== 8. src/services/document.ts =====
import api from './api';
import { Document, UploadProgress } from '../types/document';

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    const response = await api.get('/documents');
    return response.data;
  },

  async uploadDocument(file: File, onProgress?: (progress: UploadProgress) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            fileId: file.name,
            progress,
            status: 'uploading'
          });
        }
      },
    });
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async downloadDocument(id: string): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
};

