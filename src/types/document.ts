// src/types/document.ts
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  userId: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  uploadDate: string; // Added for compatibility with components
  status: 'uploading' | 'processing' | 'completed' | 'error'; // Added for compatibility
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  percentage: number; // Added for compatibility
  loaded: number; // Added for compatibility
  total: number; // Added for compatibility
}

export interface DocumentFilter {
  type?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  status?: Document['status'];
}

export interface DocumentUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  maxSize?: number;
  allowedTypes?: string[];
}