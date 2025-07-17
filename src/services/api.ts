// src/services/api.ts - Updated to use API Gateway
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../utils/constants';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    // Single instance pointing to API Gateway
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL, // http://localhost:3001 (API Gateway)
      timeout: API_CONFIG.TIMEOUT,
    });

    console.log('🔧 API Service initialized:', API_CONFIG.BASE_URL);

    // Request interceptor for auth token
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem(AUTH_CONFIG.JWT_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
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

  // Single API instance for all requests
  public get api() {
    return this.axiosInstance;
  }

  // Legacy support - maintain backward compatibility
  public get auth() {
    return this.axiosInstance;
  }

  public get documents() {
    return this.axiosInstance;
  }

  public get properties() {
    return this.axiosInstance;
  }

  public get clients() {
    return this.axiosInstance;
  }

  public get transactions() {
    return this.axiosInstance;
  }

  public get instance() {
    return this.axiosInstance;
  }
}

const apiService = new ApiService();

// Export single API instance (all requests go through API Gateway)
export const authApi = apiService.api;
export const documentsApi = apiService.api;
export const propertiesApi = apiService.api;
export const clientsApi = apiService.api;
export const transactionsApi = apiService.api;

// Main exports
export { apiService };
export default apiService.api;