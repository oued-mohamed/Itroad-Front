import React, { useState } from 'react';
import { PropertyFilter } from '../../types/property';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface PropertyFiltersProps {
  filters?: PropertyFilter;
  onFiltersChange: (filters: PropertyFilter) => void;
  onReset: () => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters = {},
  onFiltersChange,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<PropertyFilter>(filters);

  const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleArrayFilterChange = (key: keyof PropertyFilter, value: string, checked: boolean) => {
    const currentArray = (localFilters[key] as string[]) || [];
    let updatedArray: string[];
    
    if (checked) {
      updatedArray = [...currentArray, value];
    } else {
      updatedArray = currentArray.filter(item => item !== value);
    }
    
    handleFilterChange(key, updatedArray);
  };

  const handleReset = () => {
    setLocalFilters({});
    onReset();
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof PropertyFilter];
    return value !== undefined && value !== null && 
           (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleReset}
            >
              Clear All
            </Button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Price Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Price"
                type="number"
                value={localFilters.minPrice?.toString() || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min"
              />
              <Input
                label="Max Price"
                type="number"
                value={localFilters.maxPrice?.toString() || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Property Type</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['house', 'apartment', 'condo', 'townhouse', 'commercial', 'land'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(localFilters.type || []).includes(type as any)}
                    onChange={(e) => handleArrayFilterChange('type', type, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['active', 'pending', 'sold', 'rented', 'off-market'].map((status) => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(localFilters.status || []).includes(status as any)}
                    onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Bedrooms</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Bedrooms"
                type="number"
                value={localFilters.minBedrooms?.toString() || ''}
                onChange={(e) => handleFilterChange('minBedrooms', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min"
                min="0"
              />
              <Input
                label="Max Bedrooms"
                type="number"
                value={localFilters.maxBedrooms?.toString() || ''}
                onChange={(e) => handleFilterChange('maxBedrooms', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Bathrooms</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Bathrooms"
                type="number"
                step="0.5"
                value={localFilters.minBathrooms?.toString() || ''}
                onChange={(e) => handleFilterChange('minBathrooms', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min"
                min="0"
              />
              <Input
                label="Max Bathrooms"
                type="number"
                step="0.5"
                value={localFilters.maxBathrooms?.toString() || ''}
                onChange={(e) => handleFilterChange('maxBathrooms', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          {/* Square Footage */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Square Footage</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Sqft"
                type="number"
                value={localFilters.minSqft?.toString() || ''}
                onChange={(e) => handleFilterChange('minSqft', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min"
                min="0"
              />
              <Input
                label="Max Sqft"
                type="number"
                value={localFilters.maxSqft?.toString() || ''}
                onChange={(e) => handleFilterChange('maxSqft', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                value={localFilters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                placeholder="Any city"
              />
              <Input
                label="State"
                value={localFilters.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                placeholder="Any state"
              />
            </div>
          </div>

          {/* Sorting */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Field
                </label>
                <select
                  value={localFilters.sortBy || ''}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value || undefined)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Default</option>
                  <option value="price">Price</option>
                  <option value="date">Date Listed</option>
                  <option value="sqft">Square Footage</option>
                  <option value="bedrooms">Bedrooms</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Order
                </label>
                <select
                  value={localFilters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};