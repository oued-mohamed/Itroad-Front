import { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, PropertyFilter } from '../types/property';
import { propertyService } from '../services/property';
import { useApi } from './useApi';

interface UsePropertiesOptions {
  autoFetch?: boolean;
  filterBy?: PropertyFilter;
  agentId?: string;
}

interface PropertySearchParams {
  status?: Property['status'][];
  type?: Property['type'][];
  agentId?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  query?: string;
  filters?: PropertyFilter;
  page?: number;
  limit?: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const { autoFetch = true, filterBy, agentId } = options;
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch properties API call
  const {
    data: fetchedData,
    loading: fetchLoading,
    error: fetchError,
    execute: fetchProperties,
    reset: resetFetch
  } = useApi(propertyService.getProperties, {
    immediate: autoFetch && !agentId,
    onSuccess: (data) => {
      setProperties(data.properties);
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages
      });
    }
  });

  // Fetch properties by agent
  const {
    data: agentData,
    loading: agentLoading,
    execute: fetchPropertiesByAgent
  } = useApi(propertyService.getPropertiesByAgent, {
    immediate: false,
    onSuccess: (data: Property[] | { properties: Property[]; total: number; page: number; totalPages: number }) => {
      // Handle both paginated and direct array responses
      if (Array.isArray(data)) {
        setProperties(data);
        setPagination({ total: data.length, page: 1, totalPages: 1 });
      } else {
        setProperties(data.properties);
        setPagination({
          total: data.total,
          page: data.page,
          totalPages: data.totalPages
        });
      }
    }
  });

  // Get single property API call
  const {
    data: fetchedProperty,
    loading: propertyLoading,
    error: propertyError,
    execute: fetchProperty
  } = useApi(propertyService.getProperty, {
    immediate: false,
    onSuccess: (data) => {
      setCurrentProperty(data);
    }
  });

  // Create property API call
  const {
    loading: createLoading,
    error: createError,
    execute: executeCreate
  } = useApi(propertyService.createProperty, {
    onSuccess: (newProperty: Property) => {
      setProperties(prev => [newProperty, ...prev]);
    }
  });

  // Update property API call
  const {
    loading: updateLoading,
    error: updateError,
    execute: executeUpdate
  } = useApi(propertyService.updateProperty, {
    onSuccess: (updatedProperty: Property) => {
      setProperties(prev => 
        prev.map(property => 
          property.id === updatedProperty.id ? updatedProperty : property
        )
      );
      if (currentProperty?.id === updatedProperty.id) {
        setCurrentProperty(updatedProperty);
      }
    }
  });

  // Delete property API call - assuming it returns string (deleted ID)
  const {
    loading: deleteLoading,
    error: deleteError,
    execute: executeDelete
  } = useApi(async (id: string) => {
    await propertyService.deleteProperty(id);
    return id; // Return the ID for the onSuccess callback
  }, {
    onSuccess: (deletedId: string) => {
      setProperties(prev => prev.filter(property => property.id !== deletedId));
      if (currentProperty?.id === deletedId) {
        setCurrentProperty(null);
      }
    }
  });

  // Filtered properties based on filterBy
  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (!filterBy) return filtered;
    
    if (filterBy.status && filterBy.status.length > 0) {
      filtered = filtered.filter(property => 
        filterBy.status!.includes(property.status)
      );
    }
    
    if (filterBy.type && filterBy.type.length > 0) {
      filtered = filtered.filter(property => 
        filterBy.type!.includes(property.type)
      );
    }
    
    if (filterBy.city) {
      const cityLower = filterBy.city.toLowerCase();
      filtered = filtered.filter(property => 
        property.address.city.toLowerCase().includes(cityLower)
      );
    }
    
    if (filterBy.state) {
      const stateLower = filterBy.state.toLowerCase();
      filtered = filtered.filter(property => 
        property.address.state.toLowerCase().includes(stateLower)
      );
    }
    
    if (filterBy.minPrice !== undefined) {
      filtered = filtered.filter(property => 
        property.price >= filterBy.minPrice!
      );
    }
    
    if (filterBy.maxPrice !== undefined) {
      filtered = filtered.filter(property => 
        property.price <= filterBy.maxPrice!
      );
    }
    
    if (filterBy.minBedrooms !== undefined) {
      filtered = filtered.filter(property => 
        property.details?.bedrooms !== undefined && 
        property.details.bedrooms >= filterBy.minBedrooms!
      );
    }
    
    if (filterBy.maxBedrooms !== undefined) {
      filtered = filtered.filter(property => 
        property.details?.bedrooms !== undefined && 
        property.details.bedrooms <= filterBy.maxBedrooms!
      );
    }
    
    if (filterBy.minBathrooms !== undefined) {
      filtered = filtered.filter(property => 
        property.details?.bathrooms !== undefined && 
        property.details.bathrooms >= filterBy.minBathrooms!
      );
    }
    
    if (filterBy.maxBathrooms !== undefined) {
      filtered = filtered.filter(property => 
        property.details?.bathrooms !== undefined && 
        property.details.bathrooms <= filterBy.maxBathrooms!
      );
    }

    return filtered;
  }, [properties, filterBy]);

  // Create property
  const createProperty = useCallback(async (
    propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
    photos?: File[]
  ) => {
    // Handle photos if provided (you may need to implement photo upload logic)
    return await executeCreate(propertyData);
  }, [executeCreate]);

  // Update property
  const updateProperty = useCallback(async (
    id: string, 
    propertyData: Partial<Property>
  ) => {
    return await executeUpdate(id, propertyData);
  }, [executeUpdate]);

  // Delete property
  const deleteProperty = useCallback(async (id: string) => {
    await executeDelete(id);
    return id;
  }, [executeDelete]);

  // Update property status
  const updateStatus = useCallback(async (
    id: string, 
    status: Property['status']
  ) => {
    try {
      // Assuming you need to implement this method in propertyService
      const updated = await propertyService.updateProperty(id, { status });
      setProperties(prev => 
        prev.map(property => 
          property.id === id ? { ...property, status } : property
        )
      );
      if (currentProperty?.id === id) {
        setCurrentProperty(prev => prev ? { ...prev, status } : null);
      }
      return updated;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }, [currentProperty]);

  // Toggle favorite
  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  // Property selection methods
  const togglePropertySelection = useCallback((propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const selectAllProperties = useCallback(() => {
    setSelectedProperties(filteredProperties.map(p => p.id));
  }, [filteredProperties]);

  const clearSelection = useCallback(() => {
    setSelectedProperties([]);
  }, []);

  // Search params methods
  const updateSearchParams = useCallback((params: Partial<PropertySearchParams>) => {
    setSearchParams(prev => ({ ...prev, ...params }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchParams({});
    setSelectedProperties([]);
  }, []);

  // Get property by ID
  const getProperty = useCallback(async (propertyId: string) => {
    return await fetchProperty(propertyId);
  }, [fetchProperty]);

  // Grouped properties by status - Fixed type safety
  const propertiesByStatus = useMemo(() => {
    return filteredProperties.reduce((acc, property) => {
      const status = property.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(property);
      return acc;
    }, {} as Record<Property['status'], Property[]>);
  }, [filteredProperties]);

  // Grouped properties by type - Fixed type safety
  const propertiesByType = useMemo(() => {
    return filteredProperties.reduce((acc, property) => {
      const type = property.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(property);
      return acc;
    }, {} as Record<Property['type'], Property[]>);
  }, [filteredProperties]);

  // Statistics
  const stats = useMemo(() => {
    const totalValue = filteredProperties.reduce(
      (sum, property) => sum + property.price, 0
    );
    const averagePrice = filteredProperties.length > 0 
      ? totalValue / filteredProperties.length 
      : 0;
    
    // Fixed: Use Object.entries for type-safe iteration
    const byStatus = Object.entries(propertiesByStatus).reduce((acc, [status, properties]) => {
      acc[status] = properties.length;
      return acc;
    }, {} as Record<string, number>);

    const byType = Object.entries(propertiesByType).reduce((acc, [type, properties]) => {
      acc[type] = properties.length;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: filteredProperties.length,
      totalValue,
      averagePrice,
      favorites: favorites.length,
      byStatus,
      byType,
    };
  }, [filteredProperties, propertiesByStatus, propertiesByType, favorites]);

  // Convert PropertyFilter to PropertySearchParams for API calls
  const convertFilterToSearchParams = useCallback((filter?: PropertyFilter) => {
    if (!filter) return undefined;
    
    return {
      status: filter.status,
      type: filter.type,
      city: filter.city,
      state: filter.state,
      minPrice: filter.minPrice,
      maxPrice: filter.maxPrice,
      minBedrooms: filter.minBedrooms,
      maxBedrooms: filter.maxBedrooms,
      minBathrooms: filter.minBathrooms,
      maxBathrooms: filter.maxBathrooms,
    } as PropertySearchParams;
  }, []);

  // Refresh properties
  const refreshProperties = useCallback(() => {
    if (agentId) {
      fetchPropertiesByAgent(agentId);
    } else {
      resetFetch();
      const searchParamsConverted = convertFilterToSearchParams(filterBy);
      if (searchParamsConverted) {
        fetchProperties(searchParamsConverted);
      } else {
        fetchProperties();
      }
    }
  }, [agentId, fetchPropertiesByAgent, resetFetch, fetchProperties, filterBy, convertFilterToSearchParams]);

  // Effect to fetch agent properties
  useEffect(() => {
    if (agentId && autoFetch) {
      fetchPropertiesByAgent(agentId);
    }
  }, [agentId, autoFetch, fetchPropertiesByAgent]);

  // Effect to handle initial data
  useEffect(() => {
    if (fetchedData && fetchedData.properties !== properties) {
      setProperties(fetchedData.properties);
      setPagination({
        total: fetchedData.total,
        page: fetchedData.page,
        totalPages: fetchedData.totalPages
      });
    }
  }, [fetchedData]);

  return {
    // Properties data
    properties: filteredProperties,
    currentProperty,
    propertiesByStatus,
    propertiesByType,
    pagination,
    selectedProperties,
    searchParams,
    stats,
    
    // Loading states
    loading: {
      fetch: fetchLoading || agentLoading,
      property: propertyLoading,
      create: createLoading,
      update: updateLoading,
      delete: deleteLoading,
    },
    
    // Error states
    errors: {
      fetch: fetchError,
      property: propertyError,
      create: createError,
      update: updateError,
      delete: deleteError,
    },
    
    // Actions
    fetchProperties: refreshProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    updateStatus,
    getProperty,
    toggleFavorite,
    togglePropertySelection,
    selectAllProperties,
    clearSelection,
    updateSearchParams,
    resetFilters,
    refreshProperties,
  };
}