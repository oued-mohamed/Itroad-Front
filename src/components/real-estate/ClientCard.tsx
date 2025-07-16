import React from 'react';
import type { Client, ClientUrgency } from '../../types/client';
import { Button } from '../common/Button';

interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onContact: (client: Client) => void;
  onScheduleFollowUp: (client: Client) => void;
  className?: string;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onView,
  onEdit,
  onContact,
  onScheduleFollowUp,
  className = ''
}) => {
  const formatDate = (dateString?: Date): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatBudget = (budget?: Client['budget']): string => {
    if (!budget) return 'Not specified';
    const min = budget.min ? `$${(budget.min / 1000).toFixed(0)}K` : '';
    const max = budget.max ? `$${(budget.max / 1000).toFixed(0)}K` : '';
    if (min && max) return `${min} - ${max}`;
    if (min) return `${min}+`;
    if (max) return `Up to ${max}`;
    return 'Not specified';
  };

  const getStatusColor = (status: Client['status']): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: Client['type']): string => {
    switch (type) {
      case 'buyer': return 'bg-blue-100 text-blue-800';
      case 'seller': return 'bg-purple-100 text-purple-800';
      case 'renter': return 'bg-yellow-100 text-yellow-800';
      case 'landlord': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceIcon = (source: Client['source']): string => {
    switch (source) {
      case 'referral': return '👥';
      case 'website': return '🌐';
      case 'social-media': return '📱';
      case 'open-house': return '🏠';
      case 'cold-call': return '📞';
      case 'advertisement': return '📺';
      case 'repeat-client': return '🔄';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  const getUrgencyColor = (urgency?: ClientUrgency): string => {
    switch (urgency) {
      case 'immediate': return 'text-red-600';
      case 'within-month': return 'text-orange-600';
      case 'within-3-months': return 'text-yellow-600';
      case 'within-6-months': return 'text-blue-600';
      case 'no-rush': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const needsFollowUp = client.nextFollowUpDate && new Date(client.nextFollowUpDate) <= new Date();
  const daysSinceContact = client.lastContactDate 
    ? Math.floor((new Date().getTime() - new Date(client.lastContactDate).getTime()) / (1000 * 3600 * 24))
    : null;

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 ${className}`}>
      {/* Client Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-semibold text-lg">
              {client.firstName.charAt(0)}{client.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {client.firstName} {client.lastName}
            </h3>
            <p className="text-sm text-gray-500">{client.email}</p>
            <p className="text-sm text-gray-500">{client.phone}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(client.type)}`}>
            {client.type.charAt(0).toUpperCase() + client.type.slice(1)}
          </span>
        </div>
      </div>

      {/* Source and Timeline */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Source</div>
          <div className="flex items-center space-x-1">
            <span className="text-sm">{getSourceIcon(client.source)}</span>
            <span className="text-sm text-gray-700 capitalize">
              {client.source.replace('-', ' ')}
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Timeline</div>
          <div className={`text-sm font-medium ${getUrgencyColor(client.timeline?.urgency)}`}>
            {client.timeline?.urgency?.replace('-', ' ') || 'Not set'}
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">Budget</div>
        <div className="text-sm font-medium text-gray-900">
          {formatBudget(client.budget)}
          {client.budget?.preApproved && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Pre-approved
            </span>
          )}
        </div>
      </div>

      {/* Property Interests */}
      {client.propertyInterests.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Property Interests</div>
          <div className="text-sm text-gray-700">
            {client.propertyInterests.length} property(ies)
          </div>
        </div>
      )}

      {/* Preferences */}
      {client.preferences && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Preferences</div>
          <div className="text-sm text-gray-700">
            {client.preferences.bedrooms.min}-{client.preferences.bedrooms.max} bed • 
            {client.preferences.bathrooms.min}-{client.preferences.bathrooms.max} bath
            {client.preferences.sqft && (
              <span> • {client.preferences.sqft.min}-{client.preferences.sqft.max} sqft</span>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {client.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {client.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {client.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                +{client.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Last Contact</div>
            <div className="text-gray-700">
              {client.lastContactDate ? (
                <span>
                  {formatDate(client.lastContactDate)}
                  {daysSinceContact !== null && (
                    <span className={`ml-1 ${daysSinceContact > 30 ? 'text-red-600' : daysSinceContact > 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                      ({daysSinceContact}d ago)
                    </span>
                  )}
                </span>
              ) : (
                'Never'
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Next Follow-up</div>
            <div className={`text-gray-700 ${needsFollowUp ? 'text-red-600 font-medium' : ''}`}>
              {formatDate(client.nextFollowUpDate)}
              {needsFollowUp && (
                <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Due
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      {client.notes.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Latest Note</div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-700 line-clamp-2">
              {client.notes[client.notes.length - 1].content}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(client.notes[client.notes.length - 1].createdAt)} • 
              {client.notes[client.notes.length - 1].type}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onView(client)}
          className="flex-1"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onContact(client)}
          className="flex-1"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact
        </Button>
        
        <Button
          variant={needsFollowUp ? "danger" : "secondary"}
          size="sm"
          onClick={() => onScheduleFollowUp(client)}
          className="px-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l2 2 4-4" />
          </svg>
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(client)}
          className="px-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};