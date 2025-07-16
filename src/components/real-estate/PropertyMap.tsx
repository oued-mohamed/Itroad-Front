import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../../types/property';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty?: Property | null;
  onPropertySelect: (property: Property) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  property: Property;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 12,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Check if Google Maps is available
  const isGoogleMapsAvailable = typeof window !== 'undefined' && window.google && window.google.maps;

  // Initialize map
  useEffect(() => {
    if (!isGoogleMapsAvailable || !mapRef.current) return;

    const mapInstance = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const infoWindowInstance = new google.maps.InfoWindow();

    setMap(mapInstance);
    setInfoWindow(infoWindowInstance);
    setIsMapLoaded(true);
  }, [isGoogleMapsAvailable, center, zoom]);

  // Create markers for properties
  useEffect(() => {
    if (!map || !isMapLoaded) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Filter properties with coordinates
    const propertiesWithCoords = properties.filter(property => 
      property.coordinates && property.coordinates.lat && property.coordinates.lng
    );

    propertiesWithCoords.forEach(property => {
      if (!property.coordinates) return;

      const marker = new google.maps.Marker({
        position: { lat: property.coordinates.lat, lng: property.coordinates.lng },
        map,
        title: property.title,
        icon: {
          url: selectedProperty?.id === property.id 
            ? 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">$</text>
              </svg>
            `)
            : 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#10B981" stroke="#059669" stroke-width="2"/>
                <text x="12" y="16" text-anchor="middle" fill="white" font-size="10" font-weight="bold">$</text>
              </svg>
            `),
          scaledSize: selectedProperty?.id === property.id 
            ? new google.maps.Size(32, 32)
            : new google.maps.Size(24, 24)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        onPropertySelect(property);
        
        if (infoWindow) {
          const content = createInfoWindowContent(property);
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers if there are properties
    if (propertiesWithCoords.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      propertiesWithCoords.forEach(property => {
        if (property.coordinates) {
          bounds.extend({ lat: property.coordinates.lat, lng: property.coordinates.lng });
        }
      });
      map.fitBounds(bounds);
    }
  }, [map, properties, selectedProperty, isMapLoaded]);

  // Update selected property marker
  useEffect(() => {
    if (!selectedProperty || !map) return;

    // Find the marker for the selected property
    const selectedMarker = markers.find((marker, index) => {
      const property = properties.filter(p => p.coordinates)[index];
      return property?.id === selectedProperty.id;
    });

    if (selectedMarker && infoWindow) {
      const content = createInfoWindowContent(selectedProperty);
      infoWindow.setContent(content);
      infoWindow.open(map, selectedMarker);
      
      // Center map on selected property
      if (selectedProperty.coordinates) {
        map.panTo({
          lat: selectedProperty.coordinates.lat,
          lng: selectedProperty.coordinates.lng
        });
      }
    }
  }, [selectedProperty, map, markers, infoWindow]);

  const createInfoWindowContent = (property: Property): string => {
    const formatPrice = (price: number): string => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    };

    const mainPhoto = property.photos && property.photos.length > 0 
      ? property.photos[0] 
      : '/placeholder-property.jpg';

    return `
      <div style="max-width: 300px; padding: 12px;">
        <div style="width: 100%; height: 150px; background-color: #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
          <img src="${mainPhoto}" alt="${property.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='/placeholder-property.jpg'">
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${property.title}</h3>
        <div style="font-size: 18px; font-weight: 700; color: #3B82F6; margin-bottom: 8px;">${formatPrice(property.price)}</div>
        <div style="font-size: 14px; color: #6B7280; margin-bottom: 8px;">
          ${property.address.city}, ${property.address.state}
        </div>
        ${property.details.bedrooms || property.details.bathrooms || property.details.sqft ? `
          <div style="font-size: 14px; color: #6B7280; margin-bottom: 8px;">
            ${property.details.bedrooms ? `${property.details.bedrooms} bed` : ''} 
            ${property.details.bathrooms ? `• ${property.details.bathrooms} bath` : ''} 
            ${property.details.sqft ? `• ${property.details.sqft.toLocaleString()} sqft` : ''}
          </div>
        ` : ''}
        <div style="display: inline-block; padding: 4px 8px; background-color: ${getStatusColor(property.status)}; border-radius: 4px; font-size: 12px; font-weight: 500;">
          ${property.status.charAt(0).toUpperCase() + property.status.slice(1)}
        </div>
      </div>
    `;
  };

  const getStatusColor = (status: Property['status']): string => {
    switch (status) {
      case 'active': return '#DEF7EC; color: #065F46';
      case 'pending': return '#FEF3C7; color: #92400E';
      case 'sold': return '#DBEAFE; color: #1E40AF';
      case 'rented': return '#EDE9FE; color: #6B21A8';
      case 'off-market': return '#F3F4F6; color: #374151';
      default: return '#F3F4F6; color: #374151';
    }
  };

  // If Google Maps is not available, show a placeholder
  if (!isGoogleMapsAvailable) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center p-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Map Not Available</h3>
          <p className="text-sm text-gray-500 mb-4">
            Google Maps is required to display property locations.
          </p>
          <div className="grid grid-cols-1 gap-2 max-w-xs mx-auto">
            {properties.slice(0, 3).map((property) => (
              <div
                key={property.id}
                className="p-3 bg-white rounded border cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onPropertySelect(property)}
              >
                <div className="text-sm font-medium text-gray-900 truncate">{property.title}</div>
                <div className="text-xs text-gray-500">
                  {property.address.city}, {property.address.state}
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  ${(property.price / 1000).toFixed(0)}K
                </div>
              </div>
            ))}
            {properties.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{properties.length - 3} more properties
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-2 space-y-2">
        <button
          onClick={() => {
            if (map && properties.length > 0) {
              const bounds = new google.maps.LatLngBounds();
              properties.forEach(property => {
                if (property.coordinates) {
                  bounds.extend({ lat: property.coordinates.lat, lng: property.coordinates.lng });
                }
              });
              map.fitBounds(bounds);
            }
          }}
          className="block w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Fit All
        </button>
        <div className="text-xs text-gray-500 text-center">
          {properties.filter(p => p.coordinates).length} of {properties.length} mapped
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
        <div className="text-xs font-medium text-gray-900 mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Available Properties</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">Selected Property</span>
          </div>
        </div>
      </div>
    </div>
  );
};