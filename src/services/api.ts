// ===== 6. src/services/api.ts =====
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../utils/constants';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(AUTH_CONFIG.JWT_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem(AUTH_CONFIG.JWT_STORAGE_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public get instance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export default apiService.instance;

