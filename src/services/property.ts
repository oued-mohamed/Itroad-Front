
import { propertiesApi } from './api';
import type { Property, PropertyFilter, PropertySearchParams } from '../types/property';

export const propertyService = {
  // Create new property
  async createProperty(propertyData: any, photos?: File[]): Promise<Property> {
    console.log('🏠 Creating property with propertiesApi');
    
    const formData = new FormData();
    
    // Add property data
    Object.entries(propertyData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    // Add photos
    if (photos && photos.length > 0) {
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await propertiesApi.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  // Rest of your methods stay the same...
  async getProperties(params?: PropertySearchParams): Promise<{
    properties: Property[];
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

    const response = await propertiesApi.get(`/properties?${queryParams.toString()}`);
    
    if (response.data.data && Array.isArray(response.data.data)) {
      return {
        properties: response.data.data,
        total: response.data.pagination?.total || response.data.data.length,
        page: response.data.pagination?.page || 1,
        totalPages: response.data.pagination?.pages || 1
      };
    }
    
    return {
      properties: response.data || [],
      total: response.data?.length || 0,
      page: 1,
      totalPages: 1
    };
  },

  async getProperty(id: string): Promise<Property> {
    const response = await propertiesApi.get(`/properties/${id}`);
    return response.data.data || response.data;
  },

  async getPropertiesByAgent(agentId: string): Promise<Property[]> {
    const response = await propertiesApi.get(`/properties/agent/${agentId}`);
    return response.data.data || response.data || [];
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const response = await propertiesApi.put(`/properties/${id}`, property);
    return response.data.data || response.data;
  },

  async deleteProperty(id: string): Promise<void> {
    await propertiesApi.delete(`/properties/${id}`);
  },

  async uploadPhotos(propertyId: string, photos: FileList): Promise<string[]> {
    const formData = new FormData();
    Array.from(photos).forEach((photo, index) => {
      formData.append(`photo_${index}`, photo);
    });

    const response = await propertiesApi.post(`/properties/${propertyId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.photoUrls || [];
  },

  async deletePhoto(propertyId: string, photoUrl: string): Promise<void> {
    await propertiesApi.delete(`/properties/${propertyId}/photos`, {
      data: { photoUrl }
    });
  },

  async searchByLocation(lat: number, lng: number, radius: number): Promise<Property[]> {
    const response = await propertiesApi.get(`/properties/search/location`, {
      params: { lat, lng, radius }
    });
    return response.data.data || response.data || [];
  },

  async getMarketAnalysis(propertyId: string): Promise<{
    estimatedValue: number;
    comparables: Property[];
    marketTrends: any;
  }> {
    const response = await propertiesApi.get(`/properties/${propertyId}/market-analysis`);
    return response.data.data || response.data;
  },

  async toggleFavorite(propertyId: string): Promise<void> {
    await propertiesApi.post(`/properties/${propertyId}/favorite`);
  },

  async getFavorites(): Promise<Property[]> {
    const response = await propertiesApi.get('/properties/favorites');
    return response.data.data || response.data || [];
  },

  async getPropertyStats(filters?: PropertyFilter): Promise<{
    total: number;
    totalValue: number;
    averagePrice: number;
    favorites: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      queryParams.append('filters', JSON.stringify(filters));
    }

    const response = await propertiesApi.get(`/properties/stats?${queryParams.toString()}`);
    return response.data.data || response.data || {
      total: 0,
      totalValue: 0,
      averagePrice: 0,
      favorites: 0,
      byStatus: {},
      byType: {}
    };
  },

  async getPriceHistory(propertyId: string): Promise<{
    date: Date;
    price: number;
    event: 'listed' | 'price_change' | 'sold' | 'withdrawn';
  }[]> {
    const response = await propertiesApi.get(`/properties/${propertyId}/price-history`);
    return response.data.data || response.data || [];
  },

  async getSimilarProperties(propertyId: string, limit: number = 5): Promise<Property[]> {
    const response = await propertiesApi.get(`/properties/${propertyId}/similar?limit=${limit}`);
    return response.data.data || response.data || [];
  },

  async scheduleShowing(propertyId: string, showingData: {
    clientId: string;
    dateTime: Date;
    duration: number;
    notes?: string;
  }): Promise<any> {
    const response = await propertiesApi.post(`/properties/${propertyId}/showings`, showingData);
    return response.data.data || response.data;
  },

  async getPropertyShowings(propertyId: string): Promise<any[]> {
    const response = await propertiesApi.get(`/properties/${propertyId}/showings`);
    return response.data.data || response.data || [];
  },

  async updatePropertyStatus(propertyId: string, status: Property['status']): Promise<Property> {
    const response = await propertiesApi.patch(`/properties/${propertyId}/status`, { status });
    return response.data.data || response.data;
  },

  async featureProperty(propertyId: string, featured: boolean): Promise<Property> {
    const response = await propertiesApi.patch(`/properties/${propertyId}/feature`, { featured });
    return response.data.data || response.data;
  },

  async getPropertyAnalytics(propertyId: string): Promise<any> {
    const response = await propertiesApi.get(`/properties/${propertyId}/analytics`);
    return response.data.data || response.data || {};
  },

  async bulkUpdateProperties(propertyIds: string[], updates: Partial<Property>): Promise<any> {
    const response = await propertiesApi.patch('/properties/bulk', {
      propertyIds,
      updates
    });
    return response.data.data || response.data;
  },

  async exportProperties(filters?: PropertyFilter, format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters) {
      queryParams.append('filters', JSON.stringify(filters));
    }
    queryParams.append('format', format);

    const response = await propertiesApi.get(`/properties/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async importProperties(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await propertiesApi.post('/properties/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data || response.data;
  },

  async updateStatus(id: string, status: Property['status']): Promise<Property> {
    return this.updatePropertyStatus(id, status);
  },

  async search(query: string, filters?: PropertyFilter): Promise<Property[]> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    const response = await propertiesApi.get(`/properties/search?${params.toString()}`);
    return response.data.data || response.data || [];
  }
};
