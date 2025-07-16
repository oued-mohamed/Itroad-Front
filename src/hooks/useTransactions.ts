import { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, TransactionFilter, TransactionMilestone, TransactionNote } from '../types/transaction';
import { transactionService } from '../services/transaction';
import { useApi } from './useApi';

interface UseTransactionsOptions {
  autoFetch?: boolean;
  filterBy?: TransactionFilter;
  agentId?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { autoFetch = true, filterBy, agentId } = options;
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<TransactionMilestone[]>([]);

  // Fetch transactions API call
  const {
    data: fetchedTransactions,
    loading: fetchLoading,
    error: fetchError,
    execute: fetchTransactions,
    reset: resetFetch
  } = useApi(transactionService.getTransactions, {
    immediate: autoFetch && !agentId, // Fixed: ensure boolean value
    onSuccess: (data) => {
      setTransactions(data);
    }
  });

  // Fetch transactions by agent
  const {
    data: agentTransactions,
    loading: agentLoading,
    execute: fetchTransactionsByAgent
  } = useApi(transactionService.getTransactionsByAgent, {
    immediate: false,
    onSuccess: (data) => {
      setTransactions(data);
    }
  });

  // Get single transaction API call
  const {
    data: fetchedTransaction,
    loading: transactionLoading,
    error: transactionError,
    execute: fetchTransaction
  } = useApi(transactionService.getTransaction, {
    immediate: false,
    onSuccess: (data) => {
      setCurrentTransaction(data);
    }
  });

  // Create transaction API call
  const {
    loading: createLoading,
    error: createError,
    execute: executeCreate
  } = useApi(transactionService.createTransaction, {
    onSuccess: (newTransaction: Transaction) => {
      setTransactions(prev => [newTransaction, ...prev]);
    }
  });

  // Update transaction API call
  const {
    loading: updateLoading,
    error: updateError,
    execute: executeUpdate
  } = useApi(transactionService.updateTransaction, {
    onSuccess: (updatedTransaction: Transaction) => {
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        )
      );
      if (currentTransaction?.id === updatedTransaction.id) {
        setCurrentTransaction(updatedTransaction);
      }
    }
  });

  // Get analytics
  const {
    data: analytics,
    loading: analyticsLoading,
    execute: fetchAnalytics
  } = useApi(transactionService.getAnalytics, {
    immediate: false
  });

  // Get upcoming deadlines
  const {
    data: deadlines,
    loading: deadlinesLoading,
    execute: fetchUpcomingDeadlines
  } = useApi(transactionService.getUpcomingDeadlines, {
    immediate: Boolean(autoFetch && agentId), // Fixed: ensure boolean value
    onSuccess: (data) => {
      setUpcomingDeadlines(data);
    }
  });

  // Filtered transactions based on filterBy
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (!filterBy) return filtered;
    
    if (filterBy.status && filterBy.status.length > 0) {
      filtered = filtered.filter(transaction => 
        filterBy.status!.includes(transaction.status)
      );
    }
    
    if (filterBy.type && filterBy.type.length > 0) {
      filtered = filtered.filter(transaction => 
        filterBy.type!.includes(transaction.type)
      );
    }
    
    if (filterBy.agentId) {
      filtered = filtered.filter(transaction => 
        transaction.agentId === filterBy.agentId
      );
    }
    
    if (filterBy.dateRange) {
      const { start, end } = filterBy.dateRange;
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate >= start && transactionDate <= end;
      });
    }
    
    if (filterBy.minAmount !== undefined) {
      filtered = filtered.filter(transaction => 
        transaction.financial.salePrice >= filterBy.minAmount!
      );
    }
    
    if (filterBy.maxAmount !== undefined) {
      filtered = filtered.filter(transaction => 
        transaction.financial.salePrice <= filterBy.maxAmount!
      );
    }

    return filtered;
  }, [transactions, filterBy]);

  // Create transaction
  const createTransaction = useCallback(async (
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'milestones' | 'notes'>
  ) => {
    return await executeCreate(transactionData);
  }, [executeCreate]);

  // Update transaction
  const updateTransaction = useCallback(async (
    id: string, 
    transactionData: Partial<Transaction>
  ) => {
    return await executeUpdate(id, transactionData);
  }, [executeUpdate]);

  // Update transaction status
  const updateStatus = useCallback(async (
    id: string, 
    status: Transaction['status']
  ) => {
    try {
      const updated = await transactionService.updateStatus(id, status);
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? updated : transaction
        )
      );
      if (currentTransaction?.id === id) {
        setCurrentTransaction(updated);
      }
      return updated;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  }, [currentTransaction]);

  // Add milestone
  const addMilestone = useCallback(async (
    transactionId: string, 
    milestone: Omit<TransactionMilestone, 'id'>
  ) => {
    try {
      const newMilestone = await transactionService.addMilestone(transactionId, milestone);
      
      // Update local state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId 
            ? { 
                ...transaction, 
                milestones: [...transaction.milestones, newMilestone]
              }
            : transaction
        )
      );
      
      if (currentTransaction?.id === transactionId) {
        setCurrentTransaction(prev => 
          prev ? {
            ...prev,
            milestones: [...prev.milestones, newMilestone]
          } : null
        );
      }
      
      return newMilestone;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  }, [currentTransaction]);

  // Complete milestone
  const completeMilestone = useCallback(async (
    transactionId: string, 
    milestoneId: string
  ) => {
    try {
      await transactionService.completeMilestone(transactionId, milestoneId);
      
      // Update local state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId 
            ? { 
                ...transaction, 
                milestones: transaction.milestones.map(m =>
                  m.id === milestoneId 
                    ? { ...m, status: 'completed', completedDate: new Date() }
                    : m
                )
              }
            : transaction
        )
      );
      
      if (currentTransaction?.id === transactionId) {
        setCurrentTransaction(prev => 
          prev ? {
            ...prev,
            milestones: prev.milestones.map(m =>
              m.id === milestoneId 
                ? { ...m, status: 'completed', completedDate: new Date() }
                : m
            )
          } : null
        );
      }
    } catch (error) {
      console.error('Error completing milestone:', error);
      throw error;
    }
  }, [currentTransaction]);

  // Add note
  const addNote = useCallback(async (
    transactionId: string, 
    note: Omit<TransactionNote, 'id' | 'createdAt'>
  ) => {
    try {
      const newNote = await transactionService.addNote(transactionId, note);
      
      // Update local state
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === transactionId 
            ? { 
                ...transaction, 
                notes: [...transaction.notes, newNote]
              }
            : transaction
        )
      );
      
      if (currentTransaction?.id === transactionId) {
        setCurrentTransaction(prev => 
          prev ? {
            ...prev,
            notes: [...prev.notes, newNote]
          } : null
        );
      }
      
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  }, [currentTransaction]);

  // Get transaction by ID
  const getTransaction = useCallback(async (transactionId: string) => {
    return await fetchTransaction(transactionId);
  }, [fetchTransaction]);

  // Get analytics
  const getAnalytics = useCallback(async (
    agentId: string, 
    dateRange?: { start: Date; end: Date }
  ) => {
    return await fetchAnalytics(agentId, dateRange);
  }, [fetchAnalytics]);

  // Get upcoming deadlines
  const getUpcomingDeadlines = useCallback(async (
    agentId: string, 
    days: number = 7
  ) => {
    return await fetchUpcomingDeadlines(agentId, days);
  }, [fetchUpcomingDeadlines]);

  // Grouped transactions by status - Fixed type safety
  const transactionsByStatus = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      const status = transaction.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(transaction);
      return acc;
    }, {} as Record<Transaction['status'], Transaction[]>);
  }, [filteredTransactions]);

  // Grouped transactions by type - Fixed type safety
  const transactionsByType = useMemo(() => {
    return filteredTransactions.reduce((acc, transaction) => {
      const type = transaction.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(transaction);
      return acc;
    }, {} as Record<Transaction['type'], Transaction[]>);
  }, [filteredTransactions]);

  // Statistics
  const stats = useMemo(() => {
    const totalVolume = filteredTransactions.reduce(
      (sum, transaction) => sum + transaction.financial.salePrice, 0
    );
    const totalCommission = filteredTransactions.reduce(
      (sum, transaction) => sum + transaction.financial.commission.amount, 0
    );
    const averagePrice = filteredTransactions.length > 0 
      ? totalVolume / filteredTransactions.length 
      : 0;
    
    // Fixed: Use Object.entries for type-safe iteration
    const byStatus = Object.entries(transactionsByStatus).reduce((acc, [status, transactions]) => {
      acc[status] = transactions.length;
      return acc;
    }, {} as Record<string, number>);

    const byType = Object.entries(transactionsByType).reduce((acc, [type, transactions]) => {
      acc[type] = transactions.length;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: filteredTransactions.length,
      totalVolume,
      totalCommission,
      averagePrice,
      pendingDeadlines: upcomingDeadlines.length,
      byStatus,
      byType,
    };
  }, [filteredTransactions, upcomingDeadlines, transactionsByStatus, transactionsByType]);

  // Refresh transactions
  const refreshTransactions = useCallback(() => {
    if (agentId) {
      fetchTransactionsByAgent(agentId);
      if (autoFetch) {
        fetchUpcomingDeadlines(agentId, 7);
      }
    } else {
      resetFetch();
      fetchTransactions(filterBy);
    }
  }, [agentId, fetchTransactionsByAgent, resetFetch, fetchTransactions, filterBy, autoFetch, fetchUpcomingDeadlines]);

  // Effect to fetch agent transactions
  useEffect(() => {
    if (agentId && autoFetch) {
      fetchTransactionsByAgent(agentId);
      fetchUpcomingDeadlines(agentId, 7);
    }
  }, [agentId, autoFetch, fetchTransactionsByAgent, fetchUpcomingDeadlines]);

  // Effect to handle initial data
  useEffect(() => {
    if (fetchedTransactions && fetchedTransactions !== transactions) {
      setTransactions(fetchedTransactions);
    }
  }, [fetchedTransactions]);

  return {
    // Transactions data
    transactions: filteredTransactions,
    currentTransaction,
    transactionsByStatus,
    transactionsByType,
    upcomingDeadlines,
    analytics,
    stats,
    
    // Loading states
    loading: {
      fetch: fetchLoading || agentLoading,
      transaction: transactionLoading,
      create: createLoading,
      update: updateLoading,
      analytics: analyticsLoading,
      deadlines: deadlinesLoading,
    },
    
    // Error states
    errors: {
      fetch: fetchError,
      transaction: transactionError,
      create: createError,
      update: updateError,
    },
    
    // Actions
    fetchTransactions: refreshTransactions,
    createTransaction,
    updateTransaction,
    updateStatus,
    addMilestone,
    completeMilestone,
    addNote,
    getTransaction,
    getAnalytics,
    getUpcomingDeadlines,
    refreshTransactions,
  };
}