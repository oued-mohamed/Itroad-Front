import React, { useState } from 'react';
import type { Client } from '../../types/client';
import { ClientCard } from './ClientCard';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ClientForm } from '../forms/ClientForm';
import { useClients } from '../../hooks/useClients';

export const ClientList: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Client['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Client['type']>('all');

  const {
    clients,
    loading,
    errors,
    stats,
    createClient,
    updateClient,
    deleteClient,
    addNote,
    scheduleFollowUp,
    refreshClients
  } = useClients();

  const handleCreateClient = async (clientData: any) => {
    try {
      await createClient(clientData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowCreateModal(true);
  };

  const handleContactClient = (client: Client) => {
    // Open email or phone app
    if (client.email) {
      window.open(`mailto:${client.email}`, '_blank');
    }
  };

  const handleScheduleFollowUp = (client: Client) => {
    // For now, just schedule for next week
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    scheduleFollowUp(client.id, nextWeek, 'Follow-up scheduled from client list');
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient(clientId);
  };

  // Filter clients based on search and filters
  const filteredClients = clients.filter(client => {
    const matchesSearch = searchQuery === '' || 
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesType = typeFilter === 'all' || client.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading.fetch) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Client Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your client relationships and track their property needs.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </Button>
      </div>


{/* Stats Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
    <div className="text-sm text-gray-500">Total Clients</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold text-green-600">
      {stats.totalBudget > 0 
        ? `$${(stats.totalBudget / 1000000).toFixed(1)}M`
        : '$0'
      }
    </div>
    <div className="text-sm text-gray-500">Total Budget</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold text-blue-600">
      {stats.averageBudget > 0 
        ? `$${(stats.averageBudget / 1000).toFixed(0)}K`
        : '$0'
      }
    </div>
    <div className="text-sm text-gray-500">Average Budget</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="text-2xl font-bold text-orange-600">{stats.followUpsNeeded || 0}</div>
    <div className="text-sm text-gray-500">Active Follow-ups</div>
  </div>
</div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by name, email, or tags..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="buyer">Buyers</option>
              <option value="seller">Sellers</option>
              <option value="renter">Renters</option>
              <option value="landlord">Landlords</option>
            </select>
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshClients}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Client Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.byType).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-500 capitalize">{type}s</div>
            </div>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'No matching clients' 
              : 'No clients'
            }
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first client.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add First Client
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onView={handleViewClient}
              onEdit={handleEditClient}
              onContact={handleContactClient}
              onScheduleFollowUp={handleScheduleFollowUp}
            />
          ))}
        </div>
      )}

      {/* Error Display */}
      {errors.fetch && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading clients</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.fetch}</p>
              </div>
              <div className="mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={refreshClients}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Client Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedClient(null);
        }}
        title={selectedClient ? 'Edit Client' : 'Add New Client'}
      >
        <div className="max-w-4xl mx-auto">
          <ClientForm
            onSubmit={handleCreateClient}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedClient(null);
            }}
            initialData={selectedClient || undefined}
          />
        </div>
      </Modal>

      {/* View Client Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedClient(null);
        }}
        title="Client Details"
      >
        <div className="max-w-2xl mx-auto">
          {selectedClient && (
            <div className="space-y-6">
              {/* Client Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-xl">
                      {selectedClient.firstName.charAt(0)}{selectedClient.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedClient.email}</p>
                    <p className="text-gray-600">{selectedClient.phone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{selectedClient.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium capitalize">{selectedClient.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Source:</span>
                    <span className="ml-2 font-medium capitalize">{selectedClient.source.replace('-', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeline:</span>
                    <span className="ml-2 font-medium capitalize">
                      {selectedClient.timeline?.urgency?.replace('-', ' ') || 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Budget & Preferences */}
              {selectedClient.budget && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Budget</h4>
                  <p className="text-gray-700">
                    ${selectedClient.budget.min?.toLocaleString()} - ${selectedClient.budget.max?.toLocaleString()}
                    {selectedClient.budget.preApproved && (
                      <span className="ml-2 text-green-600 text-sm">(Pre-approved)</span>
                    )}
                  </p>
                </div>
              )}

              {/* Property Interests */}
              {selectedClient.propertyInterests.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Property Interests</h4>
                  <p className="text-gray-700">{selectedClient.propertyInterests.length} properties</p>
                </div>
              )}

              {/* Recent Notes */}
              {selectedClient.notes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Recent Notes</h4>
                  <div className="space-y-2">
                    {selectedClient.notes.slice(-3).map((note) => (
                      <div key={note.id} className="text-sm">
                        <div className="text-gray-700">{note.content}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(note.createdAt).toLocaleDateString()} • {note.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedClient.tags.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedClient.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowViewModal(false);
                    setShowCreateModal(true);
                  }}
                >
                  Edit Client
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};