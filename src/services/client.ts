import { clientsApi } from './api';
import type { Client, ClientFilter, ClientSearchParams } from '../types/client';


export const clientService = {
  // Get all clients
  async getClients(params?: ClientSearchParams): Promise<{
    clients: Client[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params?.query) queryParams.append('query', params.query);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.filters) {
      queryParams.append('filters', JSON.stringify(params.filters));
    }

    const response = await clientsApi.get(`/clients?${queryParams.toString()}`);
    
    if (response.data.data && Array.isArray(response.data.data)) {
      return {
        clients: response.data.data,
        total: response.data.pagination?.total || response.data.data.length,
        page: response.data.pagination?.page || 1,
        totalPages: response.data.pagination?.pages || 1
      };
    }
    
    return {
      clients: response.data || [],
      total: response.data?.length || 0,
      page: 1,
      totalPages: 1
    };
  },

  // Get single client
  async getClient(id: string): Promise<Client> {
    const response = await clientsApi.get(`/clients/${id}`);
    return response.data.data || response.data;
  },

  // Create client
  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const response = await clientsApi.post('/clients', clientData);
    return response.data.data || response.data;
  },

  // Update client
  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    const response = await clientsApi.put(`/clients/${id}`, clientData);
    return response.data.data || response.data;
  },

  // Delete client
  async deleteClient(id: string): Promise<void> {
    await clientsApi.delete(`/clients/${id}`);
  },

  // Get client statistics
  async getClientStats(filters?: ClientFilter): Promise<{
    total: number;
    buyers: number;
    sellers: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      queryParams.append('filters', JSON.stringify(filters));
    }

    const response = await clientsApi.get(`/clients/stats?${queryParams.toString()}`);
    return response.data.data || response.data || {
      total: 0,
      buyers: 0,
      sellers: 0,
      active: 0,
      inactive: 0,
      byType: {},
      byStatus: {}
    };
  },

  // Search clients
  async searchClients(query: string, filters?: ClientFilter): Promise<Client[]> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await clientsApi.get(`/clients/search?${params.toString()}`);
    return response.data.data || response.data || [];
  },

  // Get clients by type
  async getClientsByType(type: 'buyer' | 'seller'): Promise<Client[]> {
    const response = await clientsApi.get(`/clients?type=${type}`);
    return response.data.data || response.data || [];
  },

  // Get clients by status
  async getClientsByStatus(status: 'active' | 'inactive'): Promise<Client[]> {
    const response = await clientsApi.get(`/clients?status=${status}`);
    return response.data.data || response.data || [];
  }
};