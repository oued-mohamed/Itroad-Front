import React from 'react';
import { Agent } from '../../types/agent';
import { Button } from '../common/Button';

interface AgentCardProps {
  agent: Agent;
  onView: (agent: Agent) => void;
  onEdit: (agent: Agent) => void;
  onContact: (agent: Agent) => void;
  className?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onView,
  onEdit,
  onContact,
  className = ''
}) => {
  const formatExperience = (years: number): string => {
    return `${years} year${years !== 1 ? 's' : ''} experience`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 fill-current text-yellow-400" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 ${className}`}>
      {/* Agent Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
          {agent.userId ? (
            <img 
              src={`/api/users/${agent.userId}/avatar`} 
              alt={`${agent.userId}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className="text-gray-400 text-xl font-semibold">
            {agent.userId ? agent.userId.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            Agent #{agent.id.slice(-6)}
          </h3>
          <p className="text-sm text-gray-500">{agent.businessInfo.brokerage}</p>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center space-x-1">
              {renderStars(agent.rating)}
            </div>
            <span className={`text-sm font-medium ${getRatingColor(agent.rating)}`}>
              {agent.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({agent.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex flex-col items-end">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            agent.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {agent.isActive ? 'Active' : 'Inactive'}
          </div>
          <span className="text-xs text-gray-500 mt-1">
            License: {agent.licenseNumber}
          </span>
        </div>
      </div>

      {/* Experience & Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{agent.experience}</div>
          <div className="text-xs text-gray-500">Years Experience</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {formatVolume(agent.statistics.totalVolume)}
          </div>
          <div className="text-xs text-gray-500">Total Volume</div>
        </div>
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
        <div className="flex flex-wrap gap-1">
          {agent.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
            >
              {specialty.replace('-', ' ')}
            </span>
          ))}
          {agent.specialties.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
              +{agent.specialties.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Service Areas */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Service Areas</h4>
        <div className="text-sm text-gray-600">
          {agent.serviceAreas.slice(0, 2).join(', ')}
          {agent.serviceAreas.length > 2 && ` +${agent.serviceAreas.length - 2} more`}
        </div>
      </div>

      {/* Languages */}
      {agent.languages.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Languages</h4>
          <div className="text-sm text-gray-600">
            {agent.languages.slice(0, 3).join(', ')}
            {agent.languages.length > 3 && ` +${agent.languages.length - 3} more`}
          </div>
        </div>
      )}

      {/* Performance Stats */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {agent.statistics.totalSales}
            </div>
            <div className="text-xs text-gray-500">Total Sales</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {agent.statistics.averageDaysOnMarket}
            </div>
            <div className="text-xs text-gray-500">Avg. Days on Market</div>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-4">
        <div className="text-sm text-gray-600">
          📞 {agent.businessInfo.officePhone || agent.businessInfo.brokeragePhone}
        </div>
        {agent.socialMedia.website && (
          <div className="text-sm text-blue-600">
            🌐 <a href={agent.socialMedia.website} target="_blank" rel="noopener noreferrer">
              Website
            </a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onView(agent)}
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
          onClick={() => onContact(agent)}
          className="flex-1"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Contact
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(agent)}
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