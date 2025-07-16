import React, { useState } from 'react';
import { Property } from '../../types/property';
import { Button } from '../common/Button';

interface PropertyViewerProps {
  property: Property;
  onEdit: () => void;
  onClose: () => void;
}

export const PropertyViewer: React.FC<PropertyViewerProps> = ({
  property,
  onEdit,
  onClose
}) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: Date): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Property['status']): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      case 'off-market': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const nextPhoto = () => {
    if (property.photos && property.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === property.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (property.photos && property.photos.length > 0) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? property.photos.length - 1 : prev - 1
      );
    }
  };

  const currentPhoto = property.photos && property.photos.length > 0 
    ? property.photos[currentPhotoIndex] 
    : '/placeholder-property.jpg';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Photo Gallery */}
      <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden mb-6">
        <img
          src={currentPhoto}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-property.jpg';
          }}
        />
        
        {/* Photo Navigation */}
        {property.photos && property.photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Photo Indicators */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {property.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
            
            {/* Photo Counter */}
            <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded text-sm">
              {currentPhotoIndex + 1} / {property.photos.length}
            </div>
          </>
        )}
      </div>

      {/* Property Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(property.status)}`}>
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </span>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            {property.address.street}, {property.address.city}, {property.address.state} {property.address.zipCode}
          </p>
          <p className="text-sm text-gray-500">
            Listed on {formatDate(property.listingDate)}
            {property.mls && ` • MLS: ${property.mls}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {formatPrice(property.price)}
          </div>
          {property.details.sqft && (
            <div className="text-sm text-gray-500">
              ${Math.round(property.price / property.details.sqft)}/sqft
            </div>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Basic Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Property Type:</span>
              <span className="font-medium capitalize">{property.type}</span>
            </div>
            
            {property.details.bedrooms && (
              <div className="flex justify-between">
                <span className="text-gray-500">Bedrooms:</span>
                <span className="font-medium">{property.details.bedrooms}</span>
              </div>
            )}
            
            {property.details.bathrooms && (
              <div className="flex justify-between">
                <span className="text-gray-500">Bathrooms:</span>
                <span className="font-medium">{property.details.bathrooms}</span>
              </div>
            )}
            
            {property.details.sqft && (
              <div className="flex justify-between">
                <span className="text-gray-500">Square Feet:</span>
                <span className="font-medium">{property.details.sqft.toLocaleString()}</span>
              </div>
            )}
            
            {property.details.lotSize && (
              <div className="flex justify-between">
                <span className="text-gray-500">Lot Size:</span>
                <span className="font-medium">{property.details.lotSize.toLocaleString()} sqft</span>
              </div>
            )}
            
            {property.details.yearBuilt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Year Built:</span>
                <span className="font-medium">{property.details.yearBuilt}</span>
              </div>
            )}
            
            {property.details.garage && (
              <div className="flex justify-between">
                <span className="text-gray-500">Garage:</span>
                <span className="font-medium">{property.details.garage} car(s)</span>
              </div>
            )}
            
            {property.details.stories && (
              <div className="flex justify-between">
                <span className="text-gray-500">Stories:</span>
                <span className="font-medium">{property.details.stories}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="font-medium capitalize">{property.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated:</span>
              <span className="font-medium">{formatDate(property.updatedAt)}</span>
            </div>
            
            {property.virtualTourUrl && (
              <div className="pt-2">
                <a
                  href={property.virtualTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Virtual Tour
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {property.description}
        </p>
      </div>

      {/* Features */}
      {property.features && property.features.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {property.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
              >
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={onEdit}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Property
        </Button>
      </div>
    </div>
  );
};