import { useState, useEffect, useCallback, useMemo } from 'react';
import { Agent, AgentFilter } from '../types/agent';
import { agentService } from '../services/agent';
import { useApi } from './useApi';

interface UseAgentsOptions {
  autoFetch?: boolean;
  filterBy?: AgentFilter;
}

export function useAgents(options: UseAgentsOptions = {}) {
  const { autoFetch = true, filterBy } = options;
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);

  // Fetch agents API call
  const {
    data: fetchedAgents,
    loading: fetchLoading,
    error: fetchError,
    execute: fetchAgents,
    reset: resetFetch
  } = useApi(agentService.getAgents, {
    immediate: autoFetch,
    onSuccess: (data) => {
      setAgents(data);
    }
  });

  // Get single agent API call
  const {
    data: fetchedAgent,
    loading: agentLoading,
    error: agentError,
    execute: fetchAgent
  } = useApi(agentService.getAgent, {
    immediate: false,
    onSuccess: (data) => {
      setCurrentAgent(data);
    }
  });

  // Create agent API call
  const {
    loading: createLoading,
    error: createError,
    execute: executeCreate
  } = useApi(agentService.createAgent, {
    onSuccess: (newAgent: Agent) => {
      setAgents(prev => [newAgent, ...prev]);
      setCurrentAgent(newAgent);
    }
  });

  // Update agent API call
  const {
    loading: updateLoading,
    error: updateError,
    execute: executeUpdate
  } = useApi(agentService.updateAgent, {
    onSuccess: (updatedAgent: Agent) => {
      setAgents(prev => 
        prev.map(agent => agent.id === updatedAgent.id ? updatedAgent : agent)
      );
      if (currentAgent?.id === updatedAgent.id) {
        setCurrentAgent(updatedAgent);
      }
    }
  });

  // Delete agent API call
  const {
    loading: deleteLoading,
    error: deleteError,
    execute: executeDelete
  } = useApi(agentService.deleteAgent, {
    onSuccess: (_, agentId: string) => {
      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      if (currentAgent?.id === agentId) {
        setCurrentAgent(null);
      }
    }
  });

  // Get agent statistics
  const {
    data: agentStats,
    loading: statsLoading,
    execute: fetchAgentStats
  } = useApi(agentService.getAgentStats, {
    immediate: false
  });

  // Search agents
  const {
    data: searchResults,
    loading: searchLoading,
    execute: searchAgents
  } = useApi(agentService.searchAgents, {
    immediate: false
  });

  // Get top agents
  const {
    data: topAgents,
    loading: topAgentsLoading,
    execute: fetchTopAgents
  } = useApi(agentService.getTopAgents, {
    immediate: false
  });

  // Filtered agents based on filterBy
  const filteredAgents = useMemo(() => {
    if (!filterBy) return agents;
    
    return agents.filter(agent => {
      if (filterBy.specialties && filterBy.specialties.length > 0) {
        const hasSpecialty = filterBy.specialties.some(specialty => 
          agent.specialties.includes(specialty)
        );
        if (!hasSpecialty) return false;
      }
      
      if (filterBy.serviceAreas && filterBy.serviceAreas.length > 0) {
        const hasServiceArea = filterBy.serviceAreas.some(area => 
          agent.serviceAreas.some(agentArea => 
            agentArea.toLowerCase().includes(area.toLowerCase())
          )
        );
        if (!hasServiceArea) return false;
      }
      
      if (filterBy.minRating !== undefined && agent.rating < filterBy.minRating) {
        return false;
      }
      
      if (filterBy.minExperience !== undefined && agent.experience < filterBy.minExperience) {
        return false;
      }
      
      if (filterBy.languages && filterBy.languages.length > 0) {
        const hasLanguage = filterBy.languages.some(lang => 
          agent.languages.some(agentLang => 
            agentLang.toLowerCase().includes(lang.toLowerCase())
          )
        );
        if (!hasLanguage) return false;
      }
      
      if (filterBy.certifications && filterBy.certifications.length > 0) {
        const hasCertification = filterBy.certifications.some(cert => 
          agent.certifications.some(agentCert => 
            agentCert.toLowerCase().includes(cert.toLowerCase())
          )
        );
        if (!hasCertification) return false;
      }
      
      return true;
    });
  }, [agents, filterBy]);

  // Create agent
  const createAgent = useCallback(async (
    agentData: Omit<Agent, 'id' | 'joinedDate' | 'lastActiveDate'>
  ) => {
    return await executeCreate(agentData);
  }, [executeCreate]);

  // Update agent
  const updateAgent = useCallback(async (
    id: string, 
    agentData: Partial<Agent>
  ) => {
    return await executeUpdate(id, agentData);
  }, [executeUpdate]);

  // Delete agent with confirmation
  const deleteAgent = useCallback(async (agentId: string, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = window.confirm('Are you sure you want to delete this agent profile?');
      if (!confirmed) return;
    }
    
    await executeDelete(agentId);
  }, [executeDelete]);

  // Get agent by ID
  const getAgent = useCallback(async (agentId: string) => {
    return await fetchAgent(agentId);
  }, [fetchAgent]);

  // Get agent statistics
  const getAgentStatistics = useCallback(async (agentId: string) => {
    return await fetchAgentStats(agentId);
  }, [fetchAgentStats]);

  // Update agent availability
  const updateAvailability = useCallback(async (
    agentId: string, 
    availability: Agent['availability']
  ) => {
    try {
      await agentService.updateAvailability(agentId, availability);
      // Update local state
      setAgents(prev => 
        prev.map(agent => 
          agent.id === agentId 
            ? { ...agent, availability }
            : agent
        )
      );
      if (currentAgent?.id === agentId) {
        setCurrentAgent(prev => prev ? { ...prev, availability } : null);
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      throw error;
    }
  }, [currentAgent]);

  // Search agents by location and specialty
  const searchAgentsByLocation = useCallback(async (
    location: string, 
    specialty?: string
  ) => {
    return await searchAgents(location, specialty);
  }, [searchAgents]);

  // Get top performing agents
  const getTopAgents = useCallback(async (limit: number = 10) => {
    return await fetchTopAgents(limit);
  }, [fetchTopAgents]);

  // Grouped agents by specialty
  const agentsBySpecialty = useMemo(() => {
    return filteredAgents.reduce((acc, agent) => {
      agent.specialties.forEach(specialty => {
        if (!acc[specialty]) {
          acc[specialty] = [];
        }
        acc[specialty].push(agent);
      });
      return acc;
    }, {} as Record<string, Agent[]>);
  }, [filteredAgents]);

  // Grouped agents by service area
  const agentsByServiceArea = useMemo(() => {
    return filteredAgents.reduce((acc, agent) => {
      agent.serviceAreas.forEach(area => {
        if (!acc[area]) {
          acc[area] = [];
        }
        acc[area].push(agent);
      });
      return acc;
    }, {} as Record<string, Agent[]>);
  }, [filteredAgents]);

  // Statistics
  const stats = useMemo(() => {
    const totalExperience = filteredAgents.reduce((sum, agent) => sum + agent.experience, 0);
    const averageExperience = filteredAgents.length > 0 ? totalExperience / filteredAgents.length : 0;
    const averageRating = filteredAgents.length > 0 
      ? filteredAgents.reduce((sum, agent) => sum + agent.rating, 0) / filteredAgents.length 
      : 0;
    
    return {
      total: filteredAgents.length,
      averageExperience,
      averageRating,
      totalSales: filteredAgents.reduce((sum, agent) => sum + agent.statistics.totalSales, 0),
      totalVolume: filteredAgents.reduce((sum, agent) => sum + agent.statistics.totalVolume, 0),
      specialtyCount: Object.keys(agentsBySpecialty).length,
      serviceAreaCount: Object.keys(agentsByServiceArea).length,
    };
  }, [filteredAgents, agentsBySpecialty, agentsByServiceArea]);

  // Refresh agents
  const refreshAgents = useCallback(() => {
    resetFetch();
    fetchAgents(filterBy);
  }, [resetFetch, fetchAgents, filterBy]);

  // Effect to handle initial data
  useEffect(() => {
    if (fetchedAgents && fetchedAgents !== agents) {
      setAgents(fetchedAgents);
    }
  }, [fetchedAgents]);

  return {
    // Agents data
    agents: filteredAgents,
    currentAgent,
    agentsBySpecialty,
    agentsByServiceArea,
    agentStats,
    searchResults,
    topAgents,
    stats,
    
    // Loading states
    loading: {
      fetch: fetchLoading,
      agent: agentLoading,
      create: createLoading,
      update: updateLoading,
      delete: deleteLoading,
      stats: statsLoading,
      search: searchLoading,
      topAgents: topAgentsLoading,
    },
    
    // Error states
    errors: {
      fetch: fetchError,
      agent: agentError,
      create: createError,
      update: updateError,
      delete: deleteError,
    },
    
    // Actions
    fetchAgents: refreshAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    getAgent,
    getAgentStatistics,
    updateAvailability,
    searchAgentsByLocation,
    getTopAgents,
    refreshAgents,
  };
}