import { Transaction, TransactionFilter, TransactionMilestone, TransactionNote } from '../types/transaction';
import  api  from './api';

export const transactionService = {
  // Get all transactions with optional filtering
  async getTransactions(filters?: TransactionFilter): Promise<Transaction[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      queryParams.append('filters', JSON.stringify(filters));
    }
    
    const response = await api.get(`/transactions?${queryParams.toString()}`);
    return response.data;
  },

  // Get single transaction by ID
  async getTransaction(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  // Get transactions by agent
  async getTransactionsByAgent(agentId: string): Promise<Transaction[]> {
    const response = await api.get(`/transactions/agent/${agentId}`);
    return response.data;
  },

  // Get transactions by property
  async getTransactionsByProperty(propertyId: string): Promise<Transaction[]> {
    const response = await api.get(`/transactions/property/${propertyId}`);
    return response.data;
  },

  // Create new transaction
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'notes'>): Promise<Transaction> {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  // Update transaction
  async updateTransaction(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  // Update transaction status
  async updateStatus(id: string, status: Transaction['status']): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}/status`, { status });
    return response.data;
  },

  // Add milestone
  async addMilestone(transactionId: string, milestone: Omit<TransactionMilestone, 'id'>): Promise<TransactionMilestone> {
    const response = await api.post(`/transactions/${transactionId}/milestones`, milestone);
    return response.data;
  },

  // Update milestone
  async updateMilestone(transactionId: string, milestoneId: string, milestone: Partial<TransactionMilestone>): Promise<TransactionMilestone> {
    const response = await api.put(`/transactions/${transactionId}/milestones/${milestoneId}`, milestone);
    return response.data;
  },

  // Complete milestone
  async completeMilestone(transactionId: string, milestoneId: string): Promise<void> {
    await api.post(`/transactions/${transactionId}/milestones/${milestoneId}/complete`);
  },

  // Add note
  async addNote(transactionId: string, note: Omit<TransactionNote, 'id' | 'createdAt'>): Promise<TransactionNote> {
    const response = await api.post(`/transactions/${transactionId}/notes`, note);
    return response.data;
  },

  // Update note
  async updateNote(transactionId: string, noteId: string, note: Partial<TransactionNote>): Promise<TransactionNote> {
    const response = await api.put(`/transactions/${transactionId}/notes/${noteId}`, note);
    return response.data;
  },

  // Delete note
  async deleteNote(transactionId: string, noteId: string): Promise<void> {
    await api.delete(`/transactions/${transactionId}/notes/${noteId}`);
  },

  // Get transaction analytics
  async getAnalytics(agentId: string, dateRange?: { start: Date; end: Date }): Promise<{
    totalTransactions: number;
    totalVolume: number;
    averagePrice: number;
    commissionEarned: number;
    statusBreakdown: Record<Transaction['status'], number>;
    monthlyTrends: Array<{ month: string; volume: number; count: number }>;
  }> {
    const response = await api.get(`/transactions/analytics/${agentId}`, {
      params: dateRange
    });
    return response.data;
  },

  // Get upcoming deadlines
  async getUpcomingDeadlines(agentId: string, days: number = 7): Promise<TransactionMilestone[]> {
    const response = await api.get(`/transactions/deadlines/${agentId}?days=${days}`);
    return response.data;
  }
};