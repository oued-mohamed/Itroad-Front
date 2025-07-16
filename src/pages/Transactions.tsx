import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Plus, DollarSign, Calendar, Search, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, X } from 'lucide-react';

// Mock Transaction interface
interface Transaction {
  id: string;
  type: 'purchase' | 'sale' | 'lease' | 'rental';
  propertyId: string;
  clientId: string;
  agentId: string;
  status: 'pending' | 'under-contract' | 'inspection' | 'appraisal' | 'financing' | 'final-walkthrough' | 'closing' | 'closed' | 'cancelled' | 'expired';
  parties: {
    buyer: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    seller: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
  };
  documents: string[];
  commissionPaid: boolean;
  financial: {
    salePrice: number;
    commission: {
      rate: number;
      amount: number;
      split: number;
    };
    expenses: any[];
  };
  timeline: {
    closingDate?: Date;
  };
  milestones: {
    id: string;
    title: string;
    status: 'pending' | 'completed' | 'overdue';
    dueDate: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const Transactions: React.FC = () => {
  // Mock data with Moroccan context
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN-001-2024',
      type: 'purchase',
      propertyId: 'PROP-123456',
      clientId: 'CLIENT-789',
      agentId: 'AGENT-456',
      status: 'under-contract',
      parties: {
        buyer: { id: 'CLIENT-789', name: 'Ahmed Benali', email: 'ahmed.benali@gmail.com', phone: '+212 6 12 34 56 78' },
        seller: { id: 'CLIENT-890', name: 'Fatima El Mansouri', email: 'fatima.elmansouri@outlook.com', phone: '+212 6 98 76 54 32' }
      },
      documents: [],
      commissionPaid: false,
      financial: {
        salePrice: 3500000, // 3.5M DH
        commission: { rate: 3, amount: 105000, split: 100 }, // 105K DH
        expenses: []
      },
      timeline: { closingDate: new Date('2024-08-15') },
      milestones: [
        { id: '1', title: 'Contrat Initial', status: 'completed', dueDate: new Date('2024-07-01') },
        { id: '2', title: 'Inspection', status: 'pending', dueDate: new Date('2024-07-15') },
        { id: '3', title: 'Évaluation', status: 'pending', dueDate: new Date('2024-07-20') }
      ],
      createdAt: new Date('2024-07-01'),
      updatedAt: new Date('2024-07-10')
    },
    {
      id: 'TXN-002-2024',
      type: 'sale',
      propertyId: 'PROP-654321',
      clientId: 'CLIENT-111',
      agentId: 'AGENT-222',
      status: 'closed',
      parties: {
        buyer: { id: 'CLIENT-333', name: 'Youssef Ouali', email: 'y.ouali@hotmail.com', phone: '+212 6 55 44 33 22' },
        seller: { id: 'CLIENT-111', name: 'Aicha Tazi', email: 'aicha.tazi@gmail.com', phone: '+212 6 77 88 99 00' }
      },
      documents: [],
      commissionPaid: true,
      financial: {
        salePrice: 2200000, // 2.2M DH
        commission: { rate: 2.5, amount: 55000, split: 100 }, // 55K DH
        expenses: []
      },
      timeline: { closingDate: new Date('2024-06-30') },
      milestones: [
        { id: '1', title: 'Contrat Initial', status: 'completed', dueDate: new Date('2024-06-01') },
        { id: '2', title: 'Inspection', status: 'completed', dueDate: new Date('2024-06-10') },
        { id: '3', title: 'Finalisation', status: 'completed', dueDate: new Date('2024-06-30') }
      ],
      createdAt: new Date('2024-06-01'),
      updatedAt: new Date('2024-06-30')
    }
  ]);

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    type: 'purchase' as Transaction['type'],
    propertyId: '',
    clientId: '',
    agentId: '',
    salePrice: '',
    commission: '',
    commissionRate: '3',
    closingDate: '',
    description: ''
  });

  // Mock stats calculation
  const stats = {
    total: transactions.length,
    totalVolume: transactions.reduce((sum, t) => sum + t.financial.salePrice, 0),
    totalCommission: transactions.reduce((sum, t) => sum + t.financial.commission.amount, 0),
    pendingDeadlines: transactions.filter(t => t.status !== 'closed' && t.status !== 'cancelled').length,
    byStatus: transactions.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const [loading] = useState({ fetch: false });
  const [errors] = useState({ fetch: null });

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleCreateTransaction = async () => {
    if (!newTransaction.propertyId || !newTransaction.clientId || !newTransaction.salePrice || !newTransaction.agentId) {
      alert('Veuillez remplir tous les champs obligatoires: ID Propriété, ID Client, ID Agent et Prix de Vente');
      return;
    }

    try {
      // Calculate commission amount if not provided
      const salePrice = parseInt(newTransaction.salePrice);
      const commissionRate = parseFloat(newTransaction.commissionRate);
      const commissionAmount = newTransaction.commission 
        ? parseInt(newTransaction.commission)
        : Math.round(salePrice * (commissionRate / 100));

      // Create new transaction object
      const newTxn: Transaction = {
        id: `TXN-${Date.now()}`,
        type: newTransaction.type,
        propertyId: newTransaction.propertyId,
        clientId: newTransaction.clientId,
        agentId: newTransaction.agentId,
        status: 'pending',
        parties: {
          buyer: {
            id: newTransaction.clientId,
            name: 'Nouveau Client',
            email: '',
            phone: ''
          },
          seller: {
            id: '',
            name: '',
            email: '',
            phone: ''
          }
        },
        documents: [],
        commissionPaid: false,
        financial: {
          salePrice: salePrice,
          commission: {
            rate: commissionRate,
            amount: commissionAmount,
            split: 100
          },
          expenses: []
        },
        timeline: {
          closingDate: newTransaction.closingDate ? new Date(newTransaction.closingDate) : undefined
        },
        milestones: [
          { id: '1', title: 'Contrat Initial', status: 'pending', dueDate: new Date() },
          { id: '2', title: 'Inspection', status: 'pending', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          { id: '3', title: 'Évaluation', status: 'pending', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add to transactions list
      setTransactions(prev => [newTxn, ...prev]);

      setShowNewTransactionModal(false);
      setNewTransaction({
        type: 'purchase',
        propertyId: '',
        clientId: '',
        agentId: '',
        salePrice: '',
        commission: '',
        commissionRate: '3',
        closingDate: '',
        description: ''
      });

      // Show success message
      alert('Transaction créée avec succès!');
    } catch (error) {
      console.error('Erreur lors de la création de la transaction:', error);
      alert('Échec de la création de la transaction. Veuillez réessayer.');
    }
  };

  // Format currency in Moroccan Dirham
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M DH`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K DH`;
    }
    return `${amount.toLocaleString('fr-MA')} DH`;
  };

  const formatDate = (dateString: Date): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Transaction['status']): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under-contract': return 'bg-blue-100 text-blue-800';
      case 'inspection': return 'bg-purple-100 text-purple-800';
      case 'appraisal': return 'bg-indigo-100 text-indigo-800';
      case 'financing': return 'bg-orange-100 text-orange-800';
      case 'final-walkthrough': return 'bg-pink-100 text-pink-800';
      case 'closing': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Transaction['status']): string => {
    const labels: Record<Transaction['status'], string> = {
      'pending': 'En Attente',
      'under-contract': 'Sous Contrat',
      'inspection': 'Inspection',
      'appraisal': 'Évaluation',
      'financing': 'Financement',
      'final-walkthrough': 'Visite Finale',
      'closing': 'Finalisation',
      'closed': 'Finalisé',
      'cancelled': 'Annulé',
      'expired': 'Expiré'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: Transaction['type']): string => {
    const labels: Record<Transaction['type'], string> = {
      'purchase': 'Achat',
      'sale': 'Vente',
      'lease': 'Bail',
      'rental': 'Location'
    };
    return labels[type] || type;
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'pending': return Clock;
      case 'under-contract': return FileText;
      case 'inspection': return AlertCircle;
      case 'appraisal': return CheckCircle;
      case 'financing': return DollarSign;
      case 'final-walkthrough': return CheckCircle;
      case 'closing': return Calendar;
      case 'closed': return CheckCircle;
      case 'cancelled': return X;
      case 'expired': return X;
      default: return Clock;
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.propertyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.agentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Auto-calculate commission amount when sale price or rate changes
  const handleSalePriceChange = (value: string) => {
    setNewTransaction(prev => {
      const salePrice = parseInt(value) || 0;
      const rate = parseFloat(prev.commissionRate) || 0;
      const calculatedCommission = Math.round(salePrice * (rate / 100));
      
      return {
        ...prev,
        salePrice: value,
        commission: calculatedCommission.toString()
      };
    });
  };

  const handleCommissionRateChange = (value: string) => {
    setNewTransaction(prev => {
      const salePrice = parseInt(prev.salePrice) || 0;
      const rate = parseFloat(value) || 0;
      const calculatedCommission = Math.round(salePrice * (rate / 100));
      
      return {
        ...prev,
        commissionRate: value,
        commission: calculatedCommission.toString()
      };
    });
  };

  if (loading.fetch) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="mt-2 text-gray-600">
              Suivez et gérez vos transactions immobilières du contrat à la finalisation.
            </p>
          </div>
          
          {/* Enhanced New Transaction Button */}
          <button
            onClick={() => setShowNewTransactionModal(true)}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <div className="bg-white bg-opacity-20 rounded-lg p-1">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">Nouvelle Transaction</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200"></div>
          </button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Volume Total</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{formatCurrency(stats.totalVolume)}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Totale</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{formatCurrency(stats.totalCommission)}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Échéances Pendantes</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pendingDeadlines}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher transactions par ID, propriété, client ou agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous Statuts</option>
              <option value="pending">En Attente</option>
              <option value="under-contract">Sous Contrat</option>
              <option value="inspection">Inspection</option>
              <option value="appraisal">Évaluation</option>
              <option value="financing">Financement</option>
              <option value="final-walkthrough">Visite Finale</option>
              <option value="closing">Finalisation</option>
              <option value="closed">Finalisé</option>
              <option value="cancelled">Annulé</option>
              <option value="expired">Expiré</option>
            </select>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </Button>
          </div>
        </div>

        {/* Enhanced Transaction Pipeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Pipeline des Transactions</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => {
              const StatusIcon = getStatusIcon(status as Transaction['status']);
              return (
                <div key={status} className="text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${getStatusColor(status as Transaction['status'])} mb-2`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-600">
                    {getStatusLabel(status as Transaction['status'])}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Transactions List */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              {statusFilter === 'all' ? 'Toutes les Transactions' : `Transactions ${getStatusLabel(statusFilter as Transaction['status'])}`}
              <span className="ml-2 text-sm text-gray-500">({filteredTransactions.length})</span>
            </h3>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
              <p className="text-gray-500 mb-6">
                {statusFilter === 'all' 
                  ? 'Commencez par créer votre première transaction.'
                  : `Aucune transaction avec le statut: ${getStatusLabel(statusFilter as Transaction['status'])}`
                }
              </p>
              {statusFilter === 'all' && (
                <button
                  onClick={() => setShowNewTransactionModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Créer Transaction
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);
                const progress = Math.round((transaction.milestones.filter(m => m.status === 'completed').length / transaction.milestones.length) * 100) || 0;
                
                return (
                  <div
                    key={transaction.id}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewTransaction(transaction)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatusColor(transaction.status)}`}>
                          <StatusIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Transaction #{transaction.id.slice(-8)}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{getTypeLabel(transaction.type)}</span>
                            <span>Propriété #{transaction.propertyId.slice(-6)}</span>
                            <span>Client #{transaction.clientId.slice(-6)}</span>
                            <span>Agent #{transaction.agentId.slice(-6)}</span>
                            <span>Créé: {formatDate(transaction.createdAt)}</span>
                          </div>
                          <div className="mt-2 flex items-center space-x-4">
                            <div className="text-sm">
                              <span className="text-gray-500">Prix de Vente:</span>
                              <span className="ml-1 font-medium text-gray-900">
                                {formatCurrency(transaction.financial.salePrice)}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Commission:</span>
                              <span className="ml-1 font-medium text-green-600">
                                {formatCurrency(transaction.financial.commission.amount)} ({transaction.financial.commission.rate}%)
                              </span>
                            </div>
                            {transaction.timeline.closingDate && (
                              <div className="text-sm">
                                <span className="text-gray-500">Finalisation:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {formatDate(transaction.timeline.closingDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                          <StatusIcon className="w-4 h-4" />
                          {getStatusLabel(transaction.status)}
                        </span>
                        <div className="mt-2">
                          <div className="text-sm text-gray-500 mb-1">Progression: {progress}%</div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Error Display */}
        {errors.fetch && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des transactions</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errors.fetch}</p>
                </div>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Transaction Modal */}
        {showNewTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Créer Nouvelle Transaction</h2>
                  <button
                    onClick={() => setShowNewTransactionModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de Transaction *
                    </label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value as Transaction['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="purchase">Achat</option>
                      <option value="sale">Vente</option>
                      <option value="lease">Bail</option>
                      <option value="rental">Location</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Propriété *
                    </label>
                    <input
                      type="text"
                      value={newTransaction.propertyId}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, propertyId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="PROP-123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Client *
                    </label>
                    <input
                      type="text"
                      value={newTransaction.clientId}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, clientId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="CLIENT-123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Agent *
                    </label>
                    <input
                      type="text"
                      value={newTransaction.agentId}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, agentId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="AGENT-123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix de Vente (DH) *
                    </label>
                    <input
                      type="number"
                      value={newTransaction.salePrice}
                      onChange={(e) => handleSalePriceChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3500000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taux Commission (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={newTransaction.commissionRate}
                      onChange={(e) => handleCommissionRateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant Commission (DH)
                    </label>
                    <input
                      type="number"
                      value={newTransaction.commission}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, commission: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      placeholder="Calculé automatiquement"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Calculé automatiquement selon le prix et le taux</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de Finalisation Prévue
                    </label>
                    <input
                      type="date"
                      value={newTransaction.closingDate}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, closingDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={newTransaction.description}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Description supplémentaire de cette transaction..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowNewTransactionModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateTransaction}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                  >
                    Créer Transaction
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {showTransactionModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Détails Transaction - {selectedTransaction.id}
                  </h2>
                  <button
                    onClick={() => {
                      setShowTransactionModal(false);
                      setSelectedTransaction(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations Transaction</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Type:</span> {getTypeLabel(selectedTransaction.type)}</p>
                      <p><span className="font-medium">Statut:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedTransaction.status)}`}>
                          {getStatusLabel(selectedTransaction.status)}
                        </span>
                      </p>
                      <p><span className="font-medium">ID Propriété:</span> {selectedTransaction.propertyId}</p>
                      <p><span className="font-medium">ID Client:</span> {selectedTransaction.clientId}</p>
                      <p><span className="font-medium">ID Agent:</span> {selectedTransaction.agentId}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Informations Financières</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Prix de Vente:</span> {formatCurrency(selectedTransaction.financial.salePrice)}</p>
                      <p><span className="font-medium">Commission:</span> {formatCurrency(selectedTransaction.financial.commission.amount)} ({selectedTransaction.financial.commission.rate}%)</p>
                      <p><span className="font-medium">Commission Payée:</span> {selectedTransaction.commissionPaid ? 'Oui' : 'Non'}</p>
                      {selectedTransaction.timeline.closingDate && (
                        <p><span className="font-medium">Date de Finalisation:</span> {formatDate(selectedTransaction.timeline.closingDate)}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Étapes</h3>
                  <div className="space-y-2">
                    {selectedTransaction.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            milestone.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {milestone.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          <span className="font-medium">{milestone.title}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status === 'completed' ? 'Terminé' : 'En Attente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Parties Impliquées</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Acheteur</h4>
                      <p className="text-sm text-gray-600">{selectedTransaction.parties.buyer.name}</p>
                      <p className="text-sm text-gray-600">{selectedTransaction.parties.buyer.email}</p>
                      <p className="text-sm text-gray-600">{selectedTransaction.parties.buyer.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Vendeur</h4>
                      <p className="text-sm text-gray-600">{selectedTransaction.parties.seller.name || 'Non spécifié'}</p>
                      <p className="text-sm text-gray-600">{selectedTransaction.parties.seller.email || 'Non spécifié'}</p>
                      <p className="text-sm text-gray-600">{selectedTransaction.parties.seller.phone || 'Non spécifié'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};