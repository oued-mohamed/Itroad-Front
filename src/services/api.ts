// src/services/api.ts - Updated to support multiple services
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../utils/constants';

class ApiService {
  private authApi: AxiosInstance;
  private documentsApi: AxiosInstance;
  private propertiesApi: AxiosInstance;
  private clientsApi: AxiosInstance;
  private transactionsApi: AxiosInstance;

  constructor() {
    // Create separate instances for each service
    this.authApi = this.createInstance(API_CONFIG.SERVICES.AUTH);
    this.documentsApi = this.createInstance(API_CONFIG.SERVICES.DOCUMENTS);
    this.propertiesApi = this.createInstance(API_CONFIG.SERVICES.PROPERTIES);
    this.clientsApi = this.createInstance(API_CONFIG.SERVICES.CLIENTS);
    this.transactionsApi = this.createInstance(API_CONFIG.SERVICES.TRANSACTIONS);

    console.log('🔧 API Services initialized:');
    console.log('Auth:', API_CONFIG.SERVICES.AUTH);
    console.log('Properties:', API_CONFIG.SERVICES.PROPERTIES);
    console.log('Clients:', API_CONFIG.SERVICES.CLIENTS);
    console.log('Documents:', API_CONFIG.SERVICES.DOCUMENTS);
    console.log('Transactions:', API_CONFIG.SERVICES.TRANSACTIONS);
  }

  private createInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
    });

    // Request interceptor for auth token
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem(AUTH_CONFIG.JWT_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    instance.interceptors.response.use(
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

    return instance;
  }

  // Getters for each service
  public get auth() {
    return this.authApi;
  }

  public get documents() {
    return this.documentsApi;
  }

 public get properties() {
   return this.propertiesApi;
 }

 public get clients() {
   return this.clientsApi;
 }

 public get transactions() {
   return this.transactionsApi;
 }

 // Legacy support - default to auth service
 public get instance() {
   return this.authApi;
 }
}

const apiService = new ApiService();

// Export individual service instances
export const authApi = apiService.auth;
export const documentsApi = apiService.documents;
export const propertiesApi = apiService.properties;
export const clientsApi = apiService.clients;
export const transactionsApi = apiService.transactions;

// Legacy exports
export { apiService };
export default apiService.instance;