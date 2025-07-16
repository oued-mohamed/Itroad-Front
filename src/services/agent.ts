import { Agent, AgentFilter } from '../types/agent';
import  api  from './api';

export const agentService = {
  // Get all agents with optional filtering
  async getAgents(filters?: AgentFilter): Promise<Agent[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      queryParams.append('filters', JSON.stringify(filters));
    }
    
    const response = await api.get(`/agents?${queryParams.toString()}`);
    return response.data;
  },

  // Get single agent by ID
  async getAgent(id: string): Promise<Agent> {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  // Get agent by user ID
  async getAgentByUserId(userId: string): Promise<Agent> {
    const response = await api.get(`/agents/user/${userId}`);
    return response.data;
  },

  // Create agent profile
  async createAgent(agent: Omit<Agent, 'id' | 'joinedDate' | 'lastActiveDate'>): Promise<Agent> {
    const response = await api.post('/agents', agent);
    return response.data;
  },

  // Update agent profile
  async updateAgent(id: string, agent: Partial<Agent>): Promise<Agent> {
    const response = await api.put(`/agents/${id}`, agent);
    return response.data;
  },

  // Delete agent profile
  async deleteAgent(id: string): Promise<void> {
    await api.delete(`/agents/${id}`);
  },

  // Get agent statistics
  async getAgentStats(agentId: string): Promise<Agent['statistics']> {
    const response = await api.get(`/agents/${agentId}/statistics`);
    return response.data;
  },

  // Update agent availability
  async updateAvailability(agentId: string, availability: Agent['availability']): Promise<void> {
    await api.put(`/agents/${agentId}/availability`, { availability });
  },

  // Search agents by location and specialty
  async searchAgents(location: string, specialty?: string): Promise<Agent[]> {
    const response = await api.get('/agents/search', {
      params: { location, specialty }
    });
    return response.data;
  },

  // Get top agents (by rating/performance)
  async getTopAgents(limit: number = 10): Promise<Agent[]> {
    const response = await api.get(`/agents/top?limit=${limit}`);
    return response.data;
  }
};