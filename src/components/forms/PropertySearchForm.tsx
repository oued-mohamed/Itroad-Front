import React, { useState, useEffect } from 'react';
import type { PropertyFilter, PropertySearchParams } from '../../types/property';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface PropertySearchFormProps {
  onSearch: (searchParams: PropertySearchParams) => void;
  initialParams?: PropertySearchParams;
  onClear?: () => void;
  className?: string;
}

export const PropertySearchForm: React.FC<PropertySearchFormProps> = ({
  onSearch,
  initialParams,
  onClear,
  className = ''
}) => {
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({
    query: initialParams?.query || '',
    filters: initialParams?.filters || {},
    page: 1,
    limit: 20
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    if (initialParams) {
      setSearchParams(initialParams);
    }
  }, [initialParams]);

  const handleInputChange = (field: keyof PropertySearchParams, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset page when search changes
    }));
  };

  const handleFilterChange = (field: keyof PropertyFilter, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [field]: value
      },
      page: 1
    }));
  };

  const handleArrayFilterChange = (field: keyof PropertyFilter, value: string, checked: boolean) => {
    const currentArray = (searchParams.filters?.[field] as string[]) || [];
    let updatedArray: string[];
    
    if (checked) {
      updatedArray = [...currentArray, value];
    } else {
      updatedArray = currentArray.filter(item => item !== value);
    }
    
    handleFilterChange(field, updatedArray);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const handleClear = () => {
    const clearedParams: PropertySearchParams = {
      query: '',
      filters: {},
      page: 1,
      limit: 20
    };
    setSearchParams(clearedParams);
    onSearch(clearedParams);
    onClear?.();
  };

  const hasActiveFilters = () => {
    if (!searchParams.filters) return false;
    
    return Object.keys(searchParams.filters).some(key => {
      const value = searchParams.filters![key as keyof PropertyFilter];
      return value !== undefined && value !== null && 
             (Array.isArray(value) ? value.length > 0 : true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Basic Search */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <Input
              label="Search Properties"
              value={searchParams.query || ''}
              onChange={(e) => handleInputChange('query', e.target.value)}
              placeholder="Search by title, location, features..."
              className="w-full"
            />
          </div>
          <div className="flex items-end space-x-2">
            <Button type="submit" variant="primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            >
              <svg className={`w-4 h-4 mr-2 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Filters
            </Button>
            {(searchParams.query || hasActiveFilters()) && (
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="border-t border-gray-200 pt-6 space-y-6">
          {/* Quick Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Filters</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFilterChange('minPrice', 200000)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  searchParams.filters?.minPrice === 200000
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                $200K+
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('minPrice', 500000)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  searchParams.filters?.minPrice === 500000
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                $500K+
              </button>
              <button
                type="button"
                onClick={() => handleFilterChange('minBedrooms', 3)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  searchParams.filters?.minBedrooms === 3
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                3+ Bedrooms
              </button>
              <button
                type="button"
                onClick={() => handleArrayFilterChange('status', 'active', true)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  searchParams.filters?.status?.includes('active')
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active Only
              </button>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Price"
                type="number"
                value={searchParams.filters?.minPrice?.toString() || ''}
                onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min"
              />
              <Input
                label="Max Price"
                type="number"
                value={searchParams.filters?.maxPrice?.toString() || ''}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Property Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['house', 'apartment', 'condo', 'townhouse', 'commercial', 'land'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(searchParams.filters?.type || []).includes(type as any)}
                    onChange={(e) => handleArrayFilterChange('type', type, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Bedrooms</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Min"
                  type="number"
                  value={searchParams.filters?.minBedrooms?.toString() || ''}
                  onChange={(e) => handleFilterChange('minBedrooms', e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
                <Input
                  label="Max"
                  type="number"
                  value={searchParams.filters?.maxBedrooms?.toString() || ''}
                  onChange={(e) => handleFilterChange('maxBedrooms', e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Bathrooms</h3>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Min"
                  type="number"
                  step="0.5"
                  value={searchParams.filters?.minBathrooms?.toString() || ''}
                  onChange={(e) => handleFilterChange('minBathrooms', e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
                <Input
                  label="Max"
                  type="number"
                  step="0.5"
                  value={searchParams.filters?.maxBathrooms?.toString() || ''}
                  onChange={(e) => handleFilterChange('maxBathrooms', e.target.value ? Number(e.target.value) : undefined)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Square Footage */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Square Footage</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Sqft"
                type="number"
                value={searchParams.filters?.minSqft?.toString() || ''}
                onChange={(e) => handleFilterChange('minSqft', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Min"
                min="0"
              />
              <Input
                label="Max Sqft"
                type="number"
                value={searchParams.filters?.maxSqft?.toString() || ''}
                onChange={(e) => handleFilterChange('maxSqft', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Max"
                min="0"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Location</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={searchParams.filters?.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                placeholder="Any city"
              />
              <Input
                label="State"
                value={searchParams.filters?.state || ''}
                onChange={(e) => handleFilterChange('state', e.target.value || undefined)}
                placeholder="Any state"
              />
            </div>
          </div>

          {/* Property Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {['active', 'pending', 'sold', 'rented', 'off-market'].map((status) => (
                <label key={status} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(searchParams.filters?.status || []).includes(status as any)}
                    onChange={(e) => handleArrayFilterChange('status', status, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{status.replace('-', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'Swimming Pool',
                'Fireplace',
                'Garage',
                'Garden',
                'Balcony',
                'Hardwood Floors',
                'Updated Kitchen',
                'Walk-in Closet',
                'Central AC',
                'Basement',
                'Deck/Patio',
                'Security System'
              ].map((feature) => (
                <label key={feature} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(searchParams.filters?.features || []).includes(feature)}
                    onChange={(e) => handleArrayFilterChange('features', feature, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sort Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={searchParams.filters?.sortBy || ''}
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
                  Order
                </label>
                <select
                  value={searchParams.filters?.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="desc">High to Low</option>
                  <option value="asc">Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAdvancedOpen(false)}
            >
              Hide Filters
            </Button>
            <div className="flex space-x-2">
              <Button type="button" variant="secondary" onClick={handleClear}>
                Clear All
              </Button>
              <Button type="submit" variant="primary">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              Active filters applied
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </form>
  );
};