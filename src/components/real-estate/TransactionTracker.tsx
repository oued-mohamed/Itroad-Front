import React, { useState } from 'react';
import { Transaction, TransactionMilestone, TransactionNote } from '../../types/transaction';
import { Button } from '../common/Button';

interface TransactionTrackerProps {
  transaction: Transaction;
  onUpdateStatus: (status: Transaction['status']) => void;
  onCompleteMilestone: (milestoneId: string) => void;
  onAddNote: (note: Omit<TransactionNote, 'id' | 'createdAt'>) => void;
  onAddMilestone: (milestone: Omit<TransactionMilestone, 'id'>) => void;
  className?: string;
}

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({
  transaction,
  onUpdateStatus,
  onCompleteMilestone,
  onAddNote,
  onAddMilestone,
  className = ''
}) => {
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState<TransactionNote['type']>('general');
  const [newMilestone, setNewMilestone] = useState({
    name: '',
    dueDate: '',
    description: '',
    responsible: ''
  });

  const formatDate = (dateString: Date): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const getMilestoneStatusColor = (status: TransactionMilestone['status']): string => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProgressPercentage = (): number => {
    const totalMilestones = transaction.milestones.length;
    const completedMilestones = transaction.milestones.filter(m => m.status === 'completed').length;
    return totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  };

  const handleAddNote = () => {
    if (noteContent.trim()) {
      onAddNote({
        content: noteContent.trim(),
        type: noteType,
        agentId: transaction.agentId
      });
      setNoteContent('');
      setShowAddNote(false);
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.name.trim() && newMilestone.dueDate) {
      onAddMilestone({
        name: newMilestone.name.trim(),
        status: 'pending',
        dueDate: new Date(newMilestone.dueDate),
        description: newMilestone.description.trim() || undefined,
        responsible: newMilestone.responsible.trim() || 'Agent'
      });
      setNewMilestone({ name: '', dueDate: '', description: '', responsible: '' });
      setShowAddMilestone(false);
    }
  };

const nextStatuses: Record<Transaction['status'], Transaction['status'][]> = {
    pending: ['under-contract', 'cancelled'],
    'under-contract': ['inspection', 'cancelled'],
    inspection: ['appraisal', 'cancelled'],
    appraisal: ['financing', 'cancelled'],
    financing: ['final-walkthrough', 'cancelled'],
    'final-walkthrough': ['closing', 'cancelled'],
    closing: ['closed', 'cancelled'],
    closed: [],
    cancelled: [],
    expired: []
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Transaction Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Transaction #{transaction.id.slice(-8)}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="capitalize">{transaction.type}</span>
            <span>•</span>
            <span>Property #{transaction.propertyId.slice(-6)}</span>
            <span>•</span>
            <span>Client #{transaction.clientId.slice(-6)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatCurrency(transaction.financial.salePrice)}
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
            {transaction.status.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{getProgressPercentage().toFixed(0)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Financial Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sale Price:</span>
              <span className="font-medium">{formatCurrency(transaction.financial.salePrice)}</span>
            </div>
            {transaction.financial.listPrice && (
              <div className="flex justify-between">
                <span className="text-gray-600">List Price:</span>
                <span className="font-medium">{formatCurrency(transaction.financial.listPrice)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Commission:</span>
              <span className="font-medium">{formatCurrency(transaction.financial.commission.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Commission Rate:</span>
              <span className="font-medium">{transaction.financial.commission.rate}%</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Timeline</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatDate(transaction.createdAt)}</span>
            </div>
            {transaction.timeline.contractDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Contract:</span>
                <span className="font-medium">{formatDate(transaction.timeline.contractDate)}</span>
              </div>
            )}
            {transaction.timeline.closingDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Closing:</span>
                <span className="font-medium">{formatDate(transaction.timeline.closingDate)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium">{formatDate(transaction.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Parties</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Buyer:</span>
              <div className="font-medium">{transaction.parties.buyer.name}</div>
            </div>
            <div>
              <span className="text-gray-600">Seller:</span>
              <div className="font-medium">{transaction.parties.seller.name}</div>
            </div>
            {transaction.parties.lender && (
              <div>
                <span className="text-gray-600">Lender:</span>
                <div className="font-medium">{transaction.parties.lender.name}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update */}
      {nextStatuses[transaction.status].length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Update Status</h4>
          <div className="flex flex-wrap gap-2">
            {nextStatuses[transaction.status].map((status) => (
              <Button
                key={status}
                variant={status === 'cancelled' ? 'danger' : 'primary'}
                size="sm"
                onClick={() => onUpdateStatus(status)}
              >
                Move to {status.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddMilestone(true)}
          >
            Add Milestone
          </Button>
        </div>

        {showAddMilestone && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                placeholder="Milestone name"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                placeholder="Responsible person"
                value={newMilestone.responsible}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, responsible: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="primary" size="sm" onClick={handleAddMilestone}>
                Add Milestone
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowAddMilestone(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {transaction.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => milestone.status !== 'completed' && onCompleteMilestone(milestone.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    milestone.status === 'completed'
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                  disabled={milestone.status === 'completed'}
                >
                  {milestone.status === 'completed' && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div>
                  <div className="font-medium text-gray-900">{milestone.name}</div>
                  <div className="text-sm text-gray-500">
                    Due: {formatDate(milestone.dueDate)} • {milestone.responsible}
                  </div>
                  {milestone.description && (
                    <div className="text-sm text-gray-600 mt-1">{milestone.description}</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                  {milestone.status}
                </span>
                {milestone.completedDate && (
                  <div className="text-xs text-gray-500">
                    Completed: {formatDate(milestone.completedDate)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Notes</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddNote(true)}
          >
            Add Note
          </Button>
        </div>

        {showAddNote && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="mb-3">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as TransactionNote['type'])}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 mb-3"
              >
                <option value="general">General</option>
                <option value="important">Important</option>
                <option value="issue">Issue</option>
                <option value="reminder">Reminder</option>
              </select>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="primary" size="sm" onClick={handleAddNote}>
                Add Note
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowAddNote(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {transaction.notes.slice(-5).map((note) => (
            <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  note.type === 'important' ? 'bg-red-100 text-red-800' :
                  note.type === 'issue' ? 'bg-yellow-100 text-yellow-800' :
                  note.type === 'reminder' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {note.type}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-700">{note.content}</p>
            </div>
          ))}
          
          {transaction.notes.length > 5 && (
            <div className="text-center text-sm text-gray-500">
              Showing latest 5 of {transaction.notes.length} notes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};