import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Plus, Search, Users, TrendingUp, DollarSign, Calendar, Eye, Edit, Trash2, Phone, Mail, MapPin, Star, Clock, X, Home, Building, Key, Briefcase } from 'lucide-react';

type UrgencyType = 'immediate' | 'within-month' | 'within-3-months' | 'within-6-months' | 'flexible';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: 'buyer' | 'seller' | 'renter' | 'landlord';
  status: 'active' | 'inactive' | 'closed';
  address?: string;
  notes?: string;
  tags: string[];
  propertyInterests: string[];
  transactions: string[];
  source: 'referral' | 'website' | 'social-media' | 'advertisement' | 'direct' | 'other';
  budget?: {
    min?: number;
    max?: number;
    preApproved?: boolean;
  };
  timeline?: {
    urgency: UrgencyType;
    moveInDate?: Date;
  };
  nextFollowUpDate?: Date | string;
  createdAt: string;
  updatedAt: string;
}

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Benali',
      email: 'ahmed.benali@gmail.com',
      phone: '+212 6 12 34 56 78',
      type: 'buyer',
      status: 'active',
      address: '15 Avenue Mohammed V, Casablanca',
      notes: 'Cherche une villa 4 chambres dans un quartier résidentiel calme',
      tags: ['premier-achat', 'famille'],
      propertyInterests: ['PROP-001', 'PROP-003'],
      transactions: ['TXN-001'],
      source: 'website',
      budget: { min: 2500000, max: 4000000, preApproved: true },
      timeline: { urgency: 'within-3-months' },
      nextFollowUpDate: '2024-08-15',
      createdAt: '2024-07-01T10:00:00Z',
      updatedAt: '2024-07-14T15:30:00Z'
    },
    {
      id: '2',
      firstName: 'Fatima',
      lastName: 'El Mansouri',
      email: 'fatima.elmansouri@outlook.com',
      phone: '+212 6 98 76 54 32',
      type: 'seller',
      status: 'active',
      address: '78 Rue Allal Ben Abdellah, Rabat',
      notes: 'Vend son appartement familial pour déménager à l\'étranger',
      tags: ['propriétaire-motivé', 'urgent'],
      propertyInterests: ['PROP-002'],
      transactions: ['TXN-002'],
      source: 'referral',
      budget: { min: 1800000, max: 2800000 },
      timeline: { urgency: 'within-month' },
      nextFollowUpDate: '2024-08-10',
      createdAt: '2024-06-15T14:20:00Z',
      updatedAt: '2024-07-12T09:15:00Z'
    },
    {
      id: '3',
      firstName: 'Youssef',
      lastName: 'Ouali',
      email: 'y.ouali@hotmail.com',
      phone: '+212 6 55 44 33 22',
      type: 'renter',
      status: 'active',
      address: '123 Boulevard Zerktouni, Marrakech',
      notes: 'Jeune professionnel cherche appartement moderne proche du centre',
      tags: ['professionnel', 'célibataire'],
      propertyInterests: [],
      transactions: [],
      source: 'social-media',
      budget: { min: 8000, max: 15000 },
      timeline: { urgency: 'immediate' },
      nextFollowUpDate: '2024-08-05',
      createdAt: '2024-07-10T11:45:00Z',
      updatedAt: '2024-07-13T16:20:00Z'
    },
    {
      id: '4',
      firstName: 'Aicha',
      lastName: 'Tazi',
      email: 'aicha.tazi@gmail.com',
      phone: '+212 6 77 88 99 00',
      type: 'landlord',
      status: 'active',
      address: '45 Rue Hassan II, Fès',
      notes: 'Propriétaire de plusieurs biens immobiliers, cherche à investir davantage',
      tags: ['investisseur', 'expérimenté'],
      propertyInterests: ['PROP-004', 'PROP-005'],
      transactions: ['TXN-003', 'TXN-004'],
      source: 'direct',
      budget: { min: 5000000, max: 10000000 },
      timeline: { urgency: 'within-6-months' },
      nextFollowUpDate: '2024-08-20',
      createdAt: '2024-06-20T16:30:00Z',
      updatedAt: '2024-07-15T10:45:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'buyer' as Client['type'],
    status: 'active' as Client['status'],
    address: '',
    notes: '',
    source: 'direct' as Client['source'],
    budgetMin: '',
    budgetMax: '',
    urgency: 'flexible' as UrgencyType
  });

  const clientTypes = [
    { value: 'buyer', label: 'Acheteur', icon: Home },
    { value: 'seller', label: 'Vendeur', icon: DollarSign },
    { value: 'renter', label: 'Locataire', icon: Key },
    { value: 'landlord', label: 'Propriétaire', icon: Building }
  ];

  const urgencyColors: Record<UrgencyType, string> = {
    'immediate': 'text-red-600',
    'within-month': 'text-orange-600',
    'within-3-months': 'text-yellow-600',
    'within-6-months': 'text-blue-600',
    'flexible': 'text-gray-600'
  };

  const urgencyLabels: Record<UrgencyType, string> = {
    'immediate': 'Immédiat',
    'within-month': 'Dans le mois',
    'within-3-months': 'Dans 3 mois',
    'within-6-months': 'Dans 6 mois',
    'flexible': 'Flexible'
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' DH';
  };

  const getTypeInfo = (type: string) => {
    return clientTypes.find(t => t.value === type) || clientTypes[0];
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = searchTerm === '' || 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: clients.length,
    totalBudget: clients.reduce((sum, client) => sum + (client.budget?.max || 0), 0),
    averageBudget: clients.length > 0 ? clients.reduce((sum, client) => sum + (client.budget?.max || 0), 0) / clients.length : 0,
    activeFollowUps: clients.filter(client => {
      if (!client.nextFollowUpDate) return false;
      const followUpDate = new Date(client.nextFollowUpDate);
      const today = new Date();
      const daysUntil = Math.ceil((followUpDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7;
    }).length
  };

  const handleCreateClient = () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.email) {
      alert('Veuillez remplir les champs obligatoires: Prénom, Nom et Email');
      return;
    }

    const client: Client = {
      id: `client-${Date.now()}`,
      firstName: newClient.firstName,
      lastName: newClient.lastName,
      email: newClient.email,
      phone: newClient.phone,
      type: newClient.type,
      status: newClient.status,
      address: newClient.address,
      notes: newClient.notes,
      tags: [],
      propertyInterests: [],
      transactions: [],
      source: newClient.source,
      budget: {
        min: newClient.budgetMin ? parseInt(newClient.budgetMin) : undefined,
        max: newClient.budgetMax ? parseInt(newClient.budgetMax) : undefined,
        preApproved: false
      },
      timeline: {
        urgency: newClient.urgency
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClients(prev => [client, ...prev]);
    setShowNewClientModal(false);
    setNewClient({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      type: 'buyer',
      status: 'active',
      address: '',
      notes: '',
      source: 'direct',
      budgetMin: '',
      budgetMax: '',
      urgency: 'flexible'
    });
  };

  const deleteClient = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
      setClients(prev => prev.filter(client => client.id !== id));
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Gérez vos relations clients et suivez leurs besoins immobiliers.</p>
          </div>
          
          <button
            onClick={() => setShowNewClientModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Ajouter Client
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalBudget)}</p>
              </div>
              <div className="text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Budget Moyen</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageBudget)}</p>
              </div>
              <div className="text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suivis Actifs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activeFollowUps}</p>
              </div>
              <div className="text-orange-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded border p-4 mb-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher clients par nom, email ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous Statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="closed">Fermé</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="all">Tous Types</option>
              <option value="buyer">Acheteurs</option>
              <option value="seller">Vendeurs</option>
              <option value="renter">Locataires</option>
              <option value="landlord">Propriétaires</option>
            </select>

            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>

        {/* Client Distribution */}
        <div className="bg-white rounded border p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Répartition des Clients</h3>
          <div className="grid grid-cols-4 gap-4">
            {clientTypes.map(type => {
              const count = clients.filter(c => c.type === type.value).length;
              const IconComponent = type.icon;
              return (
                <div key={type.value} className="text-center">
                  <div className="text-blue-600 mb-1 flex justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-600">{type.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clients Display */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded border p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'Aucun client correspondant' : 'Aucun client'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Essayez d\'ajuster votre recherche ou vos filtres'
                : 'Ajoutez votre premier client pour commencer'
              }
            </p>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-3 shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Ajouter Premier Client
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredClients.map((client) => {
              const typeInfo = getTypeInfo(client.type);
              const fullName = `${client.firstName} ${client.lastName}`;
              const IconComponent = typeInfo.icon;
              
              return (
                <div key={client.id} className={`bg-white rounded border hover:shadow-sm transition-shadow ${viewMode === 'list' ? 'p-3' : 'p-4'}`}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-blue-600">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{fullName}</h3>
                            <p className="text-sm text-gray-500">{typeInfo.label}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-medium ${
                          client.status === 'active' ? 'text-green-600' :
                          client.status === 'inactive' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {client.status === 'active' ? 'Actif' : client.status === 'inactive' ? 'Inactif' : 'Fermé'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{client.phone}</span>
                        </div>
                        {client.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{client.address}</span>
                          </div>
                        )}
                      </div>

                      {client.budget && (
                        <div className="bg-gray-50 rounded p-3 mb-3">
                          <p className="text-sm font-medium text-gray-700">Budget</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(client.budget.min || 0)} - {formatCurrency(client.budget.max || 0)}
                          </p>
                          {client.budget.preApproved && (
                            <span className="text-xs text-green-600 mt-1 inline-flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Pré-approuvé
                            </span>
                          )}
                        </div>
                      )}

                      {client.timeline?.urgency && (
                        <div className="mb-3">
                          <span className={`text-xs font-medium ${urgencyColors[client.timeline.urgency]} inline-flex items-center gap-1`}>
                            <Clock className="w-3 h-3" />
                            {urgencyLabels[client.timeline.urgency]}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200">
                          <Eye className="w-4 h-4" />
                          Voir
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteClient(client.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{fullName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{typeInfo.label}</span>
                            <span>{client.email}</span>
                            <span>{client.phone}</span>
                            {client.budget && (
                              <span>Budget: {formatCurrency(client.budget.min || 0)} - {formatCurrency(client.budget.max || 0)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium ${
                          client.status === 'active' ? 'text-green-600' :
                          client.status === 'inactive' ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {client.status === 'active' ? 'Actif' : client.status === 'inactive' ? 'Inactif' : 'Fermé'}
                        </span>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium p-2 rounded-lg transition-all duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium p-2 rounded-lg transition-all duration-200">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteClient(client.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium p-2 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* New Client Modal */}
        {showNewClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Ajouter Nouveau Client</h2>
                  <button
                    onClick={() => setShowNewClientModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input
                      type="text"
                      value={newClient.firstName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="Ahmed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input
                      type="text"
                      value={newClient.lastName}
                      onChange={(e) => setNewClient(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="Benali"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="ahmed.benali@gmail.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={newClient.phone}
                      onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="+212 6 12 34 56 78"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Client</label>
                    <select
                      value={newClient.type}
                      onChange={(e) => setNewClient(prev => ({ ...prev, type: e.target.value as Client['type'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="buyer">Acheteur</option>
                      <option value="seller">Vendeur</option>
                      <option value="renter">Locataire</option>
                      <option value="landlord">Propriétaire</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <select
                      value={newClient.source}
                      onChange={(e) => setNewClient(prev => ({ ...prev, source: e.target.value as Client['source'] }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="direct">Contact Direct</option>
                      <option value="referral">Recommandation</option>
                      <option value="website">Site Web</option>
                      <option value="social-media">Réseaux Sociaux</option>
                      <option value="advertisement">Publicité</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Min (DH)</label>
                    <input
                      type="number"
                      value={newClient.budgetMin}
                      onChange={(e) => setNewClient(prev => ({ ...prev, budgetMin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="2500000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Max (DH)</label>
                    <input
                      type="number"
                      value={newClient.budgetMax}
                      onChange={(e) => setNewClient(prev => ({ ...prev, budgetMax: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="4000000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Urgence</label>
                    <select
                      value={newClient.urgency}
                      onChange={(e) => setNewClient(prev => ({ ...prev, urgency: e.target.value as UrgencyType }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="immediate">Immédiat</option>
                      <option value="within-month">Dans le mois</option>
                      <option value="within-3-months">Dans 3 mois</option>
                      <option value="within-6-months">Dans 6 mois</option>
                      <option value="flexible">Flexible</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={newClient.address}
                      onChange={(e) => setNewClient(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="15 Avenue Mohammed V, Casablanca"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows={3}
                      value={newClient.notes}
                      onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      placeholder="Notes supplémentaires sur les préférences du client, exigences ou informations importantes..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowNewClientModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateClient}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                  >
                    Ajouter Client
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};