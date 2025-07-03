
// ===== 1. src/types/index.ts =====
export * from './auth';
export * from './user';
export * from './document';

// Common interfaces
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

