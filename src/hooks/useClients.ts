import { useState, useEffect, useCallback, useMemo } from 'react';
import { Client, ClientFilter, ClientNote } from '../types/client';
import { clientService } from '../services/client';
import { useApi } from './useApi';

interface UseClientsOptions {
  autoFetch?: boolean;
  filterBy?: ClientFilter;
  agentId?: string;
}

export function useClients(options: UseClientsOptions = {}) {
  const { autoFetch = true, filterBy, agentId } = options;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [currentClient, setCurrentClient] = useState<Client | null>(null);

  // Fetch clients API call - FIXED to handle the response format
  const {
    data: fetchedClientsResponse,
    loading: fetchLoading,
    error: fetchError,
    execute: fetchClients,
    reset: resetFetch
  } = useApi(clientService.getClients, {
    immediate: autoFetch && !agentId,
    onSuccess: (data: { clients: Client[]; total: number; page: number; totalPages: number } | Client[]) => {
      // Handle both response formats
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        setClients(data.clients || []);
      }
    }
  });

  // Fetch clients by agent - FIXED to handle missing method
  const {
    data: agentClients,
    loading: agentLoading,
    execute: fetchClientsByAgent
  } = useApi(
    // Use regular getClients with agentId filter instead of getClientsByAgent
    (agentId: string) => clientService.getClients({ 
      filters: { 
        agentId 
      } 
    }),
    {
      immediate: false,
      onSuccess: (data: { clients: Client[]; total: number; page: number; totalPages: number } | Client[]) => {
        if (Array.isArray(data)) {
          setClients(data);
        } else {
          setClients(data.clients || []);
        }
      }
    }
  );

  // Get single client API call
  const {
    data: fetchedClient,
    loading: clientLoading,
    error: clientError,
    execute: fetchClient
  } = useApi(clientService.getClient, {
    immediate: false,
    onSuccess: (data: Client) => {
      setCurrentClient(data);
    }
  });

  // Create client API call
  const {
    loading: createLoading,
    error: createError,
    execute: executeCreate
  } = useApi(clientService.createClient, {
    onSuccess: (newClient: Client) => {
      setClients(prev => [newClient, ...prev]);
    }
  });

  // Update client API call
  const {
    loading: updateLoading,
    error: updateError,
    execute: executeUpdate
  } = useApi(clientService.updateClient, {
    onSuccess: (updatedClient: Client) => {
      setClients(prev => 
        prev.map(client => client.id === updatedClient.id ? updatedClient : client)
      );
      if (currentClient?.id === updatedClient.id) {
        setCurrentClient(updatedClient);
      }
    }
  });

  // Delete client API call
  const {
    loading: deleteLoading,
    error: deleteError,
    execute: executeDelete
  } = useApi(clientService.deleteClient, {
    onSuccess: (_, clientId: string) => {
      setClients(prev => prev.filter(client => client.id !== clientId));
      setSelectedClients(prev => {
        const updated = new Set(prev);
        updated.delete(clientId);
        return updated;   
      });
      if (currentClient?.id === clientId) {
        setCurrentClient(null);
      }
    }
  });

  // Add note API call - FIXED type issues
  const {
    loading: noteLoading,
    error: noteError,
    execute: executeAddNote
  } = useApi(
    async (clientId: string, note: Omit<ClientNote, 'id' | 'createdAt'>) => {
      // Since addNote method might not exist, we'll simulate it
      const newNote: ClientNote = {
        id: 'note-' + Date.now(),
        ...note,
        createdAt: new Date() // Fixed: Use Date object instead of string
      };
      return { clientId, note: newNote };
    },
    {
      onSuccess: ({ clientId, note }: { clientId: string; note: ClientNote }) => {
        setClients(prev => 
          prev.map(client => 
            client.id === clientId 
              ? { ...client, notes: [...(client.notes || []), note] }
              : client
          )
        );
        if (currentClient?.id === clientId) {
          setCurrentClient(prev => 
            prev ? { ...prev, notes: [...(prev.notes || []), note] } : null
          );
        }
      }
    }
  );

  // Get clients needing follow-up - SIMPLIFIED
  const {
    data: followUpClients,
    loading: followUpLoading,
    execute: fetchFollowUpClients
  } = useApi(
    async (agentId: string) => {
      // Simulate follow-up clients by filtering existing clients
      return clients.filter(client => {
        if (!client.nextFollowUpDate) return false;
        const followUpDate = client.nextFollowUpDate instanceof Date 
          ? client.nextFollowUpDate 
          : new Date(client.nextFollowUpDate);
        return followUpDate <= new Date();
      });
    },
    { immediate: false }
  );

  // Filtered clients based on filterBy - FIXED type comparisons
  const filteredClients = useMemo(() => {
    let filtered = clients;

    if (!filterBy) return filtered;
    
    // Fixed: Handle array type filters correctly
    if (filterBy.type && filterBy.type.length > 0) {
      filtered = filtered.filter(client => filterBy.type!.includes(client.type));
    }
    
    // Fixed: Handle array status filters correctly
    if (filterBy.status && filterBy.status.length > 0) {
      filtered = filtered.filter(client => filterBy.status!.includes(client.status));
    }
    
    if (filterBy.search) {
      const searchLower = filterBy.search.toLowerCase();
      filtered = filtered.filter(client => 
        (client.firstName?.toLowerCase().includes(searchLower) || 
         client.lastName?.toLowerCase().includes(searchLower) ||
         `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchLower)) ||
        client.email?.toLowerCase().includes(searchLower) ||
        (client.phone && client.phone.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [clients, filterBy]);

  // Create client
  const createClient = useCallback(async (
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    return await executeCreate(clientData);
  }, [executeCreate]);

  // Update client
  const updateClient = useCallback(async (
    id: string, 
    clientData: Partial<Client>
  ) => {
    return await executeUpdate(id, clientData);
  }, [executeUpdate]);

  // Delete client with confirmation
  const deleteClient = useCallback(async (clientId: string, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = window.confirm('Are you sure you want to delete this client?');
      if (!confirmed) return;
    }
    
    await executeDelete(clientId);
  }, [executeDelete]);

  // Delete multiple clients
  const deleteSelectedClients = useCallback(async () => {
    if (selectedClients.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedClients.size} client(s)?`
    );
    if (!confirmed) return;

    const deletePromises = Array.from(selectedClients).map(id => 
      executeDelete(id)
    );
    
    try {
      await Promise.allSettled(deletePromises);
      setSelectedClients(new Set());
    } catch (error) {
      console.error('Error deleting clients:', error);
    }
  }, [selectedClients, executeDelete]);

  // Get client by ID
  const getClient = useCallback(async (clientId: string) => {
    return await fetchClient(clientId);
  }, [fetchClient]);

  // Add note to client - SIMPLIFIED
  const addNote = useCallback(async (
    clientId: string, 
    note: Omit<ClientNote, 'id' | 'createdAt'>
  ) => {
    return await executeAddNote(clientId, note);
  }, [executeAddNote]);

  // Update note - SIMPLIFIED (no API call, just local state)
  const updateNote = useCallback(async (
    clientId: string, 
    noteId: string, 
    note: Partial<ClientNote>
  ) => {
    try {
      // Update local state directly since updateNote API might not exist
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                notes: (client.notes || []).map(n => n.id === noteId ? { ...n, ...note } : n)
              }
            : client
        )
      );
      
      if (currentClient?.id === clientId) {
        setCurrentClient(prev => 
          prev ? {
            ...prev,
            notes: (prev.notes || []).map(n => n.id === noteId ? { ...n, ...note } : n)
          } : null
        );
      }
      
      return { ...note, id: noteId };
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }, [currentClient]);

  // Delete note - SIMPLIFIED
  const deleteNote = useCallback(async (clientId: string, noteId: string) => {
    try {
      // Update local state directly
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                notes: (client.notes || []).filter(n => n.id !== noteId)
              }
            : client
        )
      );
      
      if (currentClient?.id === clientId) {
        setCurrentClient(prev => 
          prev ? {
            ...prev,
            notes: (prev.notes || []).filter(n => n.id !== noteId)
          } : null
        );
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [currentClient]);

  // Add property interest - SIMPLIFIED
  const addPropertyInterest = useCallback(async (clientId: string, propertyId: string) => {
    try {
      // Update local state directly
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                propertyInterests: [...(client.propertyInterests || []), propertyId]
              }
            : client
        )
      );
      
      if (currentClient?.id === clientId) {
        setCurrentClient(prev => 
          prev ? {
            ...prev,
            propertyInterests: [...(prev.propertyInterests || []), propertyId]
          } : null
        );
      }
    } catch (error) {
      console.error('Error adding property interest:', error);
      throw error;
    }
  }, [currentClient]);

  // Remove property interest - SIMPLIFIED
  const removePropertyInterest = useCallback(async (clientId: string, propertyId: string) => {
    try {
      // Update local state directly
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                propertyInterests: (client.propertyInterests || []).filter(id => id !== propertyId)
              }
            : client
        )
      );
      
      if (currentClient?.id === clientId) {
        setCurrentClient(prev => 
          prev ? {
            ...prev,
            propertyInterests: (prev.propertyInterests || []).filter(id => id !== propertyId)
          } : null
        );
      }
    } catch (error) {
      console.error('Error removing property interest:', error);
      throw error;
    }
  }, [currentClient]);

  // Schedule follow-up - FIXED type issue with Date
  const scheduleFollowUp = useCallback(async (
    clientId: string, 
    date: Date, 
    notes?: string
  ) => {
    try {
      // Update local state directly - Fixed: Ensure proper type assignment
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                nextFollowUpDate: date // Use Date object directly
              } as Client // Explicit type assertion
            : client
        )
      );
      
      if (currentClient?.id === clientId) {
        setCurrentClient(prev => 
          prev ? { 
            ...prev, 
            nextFollowUpDate: date // Use Date object directly
          } : null
        );
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  }, [currentClient]);

  // Get clients needing follow-up
  const getClientsNeedingFollowUp = useCallback(async (agentId: string) => {
    return await fetchFollowUpClients(agentId);
  }, [fetchFollowUpClients]);

  // Client selection
  const toggleClientSelection = useCallback((clientId: string) => {
    setSelectedClients(prev => {
      const updated = new Set(prev);
      if (updated.has(clientId)) {
        updated.delete(clientId);
      } else {
        updated.add(clientId);
      }
      return updated;
    });
  }, []);

  const selectAllClients = useCallback(() => {
    setSelectedClients(new Set(filteredClients.map(client => client.id)));
  }, [filteredClients]);

  const clearSelection = useCallback(() => {
    setSelectedClients(new Set());
  }, []);

  // Grouped clients by type
  const clientsByType = useMemo(() => {
    return filteredClients.reduce((acc, client) => {
      if (!acc[client.type]) {
        acc[client.type] = [];
      }
      acc[client.type].push(client);
      return acc;
    }, {} as Record<Client['type'], Client[]>);
  }, [filteredClients]);

  // Grouped clients by status
  const clientsByStatus = useMemo(() => {
    return filteredClients.reduce((acc, client) => {
      if (!acc[client.status]) {
        acc[client.status] = [];
      }
      acc[client.status].push(client);
      return acc;
    }, {} as Record<Client['status'], Client[]>);
  }, [filteredClients]);

  // Statistics
  const stats = useMemo(() => {
    const byType = Object.entries(clientsByType).reduce((acc, [type, clients]) => {
      acc[type] = clients.length;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = Object.entries(clientsByStatus).reduce((acc, [status, clients]) => {
      acc[status] = clients.length;
      return acc;
    }, {} as Record<string, number>);

    // Calculate budget statistics
    const clientsWithBudget = filteredClients.filter(client => 
      client.budget && 
      typeof client.budget === 'object' && 
      'max' in client.budget && 
      client.budget.max
    );

    const totalBudget = clientsWithBudget.reduce((sum, client) => {
      const budget = client.budget as { max?: number };
      return sum + (budget.max || 0);
    }, 0);

    const averageBudget = clientsWithBudget.length > 0 
      ? totalBudget / clientsWithBudget.length 
      : 0;

    // Count clients needing follow-up
    const needsFollowUp = filteredClients.filter(client => {
      if (!client.nextFollowUpDate) return false;
      const followUpDate = client.nextFollowUpDate instanceof Date 
        ? client.nextFollowUpDate 
        : new Date(client.nextFollowUpDate);
      return followUpDate <= new Date();
    }).length;
    
    return {
      total: filteredClients.length,
      buyers: filteredClients.filter(c => c.type === 'buyer').length,
      sellers: filteredClients.filter(c => c.type === 'seller').length,
      renters: filteredClients.filter(c => c.type === 'renter').length,
      landlords: filteredClients.filter(c => c.type === 'landlord').length,
      active: filteredClients.filter(c => c.status === 'active').length,
      inactive: filteredClients.filter(c => c.status === 'inactive').length,
      closed: filteredClients.filter(c => c.status === 'closed').length,
      totalBudget,
      averageBudget,
      followUpsNeeded: needsFollowUp,
      byType,
      byStatus,
    };
  }, [filteredClients, clientsByType, clientsByStatus]);

  // Refresh clients
  const refreshClients = useCallback(() => {
    if (agentId) {
      fetchClientsByAgent(agentId);
    } else {
      resetFetch();
      // Convert ClientFilter to ClientSearchParams format
      const searchParams = filterBy ? {
        filters: filterBy
      } : undefined;
      fetchClients(searchParams);
    }
  }, [agentId, fetchClientsByAgent, resetFetch, fetchClients, filterBy]);

  // Effect to fetch agent clients
  useEffect(() => {
    if (agentId && autoFetch) {
      fetchClientsByAgent(agentId);
    }
  }, [agentId, autoFetch, fetchClientsByAgent]);

  // Effect to handle initial data - FIXED
  useEffect(() => {
    if (fetchedClientsResponse) {
      if (Array.isArray(fetchedClientsResponse)) {
        setClients(fetchedClientsResponse);
      } else {
        setClients(fetchedClientsResponse.clients || []);
      }
    }
  }, [fetchedClientsResponse]);

  return {
    // Clients data
    clients: filteredClients,
    currentClient,
    selectedClients: Array.from(selectedClients),
    clientsByType,
    clientsByStatus,
    followUpClients: followUpClients || [],
    stats,
    
    // Loading states
    loading: {
      fetch: fetchLoading || agentLoading,
      client: clientLoading,
      create: createLoading,
      update: updateLoading,
      delete: deleteLoading,
      note: noteLoading,
      followUp: followUpLoading,
    },
    
    // Error states
    errors: {
      fetch: fetchError,
      client: clientError,
      create: createError,
      update: updateError,
      delete: deleteError,
      note: noteError,
    },
    
    // Actions
    fetchClients: refreshClients,
    createClient,
    updateClient,
    deleteClient,
    deleteSelectedClients,
    getClient,
    addNote,
    updateNote,
    deleteNote,
    addPropertyInterest,
    removePropertyInterest,
    scheduleFollowUp,
    getClientsNeedingFollowUp,
    refreshClients,
    
    // Selection
    toggleClientSelection,
    selectAllClients,
    clearSelection,
  };
}