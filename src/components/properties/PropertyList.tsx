import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Home, 
  DollarSign, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Eye,
  Edit,
  Trash2,
  X,
  Star,
  TrendingUp,
  Upload
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land';
  status: 'active' | 'pending' | 'sold' | 'rented' | 'inactive';
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize?: number;
  yearBuilt: number;
  images: string[];
  features: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NewPropertyForm {
  title: string;
  description: string;
  price: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: Property['type'];
  status: Property['status'];
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  lotSize: string;
  yearBuilt: string;
  features: string;
  images: string[];
}

export const PropertyList: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([
    {
      id: 'PROP-001',
      title: 'Modern Family Home',
      description: 'Beautiful 3-bedroom house with updated kitchen and spacious backyard.',
      price: 450000,
      address: '123 Oak Street',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90210',
      type: 'house',
      status: 'active',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1850,
      lotSize: 0.25,
      yearBuilt: 2015,
      images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'],
      features: ['Garage', 'Garden', 'Modern Kitchen'],
      isFavorite: true,
      createdAt: '2024-06-01T10:00:00Z',
      updatedAt: '2024-07-01T10:00:00Z'
    },
    {
      id: 'PROP-002',
      title: 'Downtown Luxury Apartment',
      description: 'Stunning 2-bedroom apartment in the heart of downtown with city views.',
      price: 325000,
      address: '456 Main Avenue',
      city: 'Springfield',
      state: 'CA',
      zipCode: '90211',
      type: 'apartment',
      status: 'active',
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      yearBuilt: 2020,
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
      features: ['City View', 'Balcony', 'Gym Access'],
      isFavorite: false,
      createdAt: '2024-06-15T14:00:00Z',
      updatedAt: '2024-07-05T14:00:00Z'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showNewPropertyModal, setShowNewPropertyModal] = useState<boolean>(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState<boolean>(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [newProperty, setNewProperty] = useState<NewPropertyForm>({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'house',
    status: 'active',
    bedrooms: '',
    bathrooms: '',
    squareFeet: '',
    lotSize: '',
    yearBuilt: '',
    features: '',
    images: []
  });

  const propertyTypes = [
    { value: 'house' as const, label: 'House', icon: Home },
    { value: 'apartment' as const, label: 'Apartment', icon: Home },
    { value: 'condo' as const, label: 'Condo', icon: Home },
    { value: 'townhouse' as const, label: 'Townhouse', icon: Home },
    { value: 'land' as const, label: 'Land', icon: Square }
  ];

  const propertyStatuses = [
    { value: 'active' as const, label: 'Active', color: 'text-green-600' },
    { value: 'pending' as const, label: 'Pending', color: 'text-yellow-600' },
    { value: 'sold' as const, label: 'Sold', color: 'text-blue-600' },
    { value: 'rented' as const, label: 'Rented', color: 'text-purple-600' },
    { value: 'inactive' as const, label: 'Inactive', color: 'text-gray-600' }
  ];

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: Property['status']): string => {
    return propertyStatuses.find(s => s.value === status)?.color || 'text-gray-600';
  };

  const getTypeInfo = (type: Property['type']) => {
    return propertyTypes.find(t => t.value === type) || propertyTypes[0];
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = searchTerm === '' || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: properties.length,
    totalValue: properties.reduce((sum, p) => sum + p.price, 0),
    averagePrice: properties.length > 0 ? properties.reduce((sum, p) => sum + p.price, 0) / properties.length : 0,
    favorites: properties.filter(p => p.isFavorite).length,
    byStatus: properties.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byType: properties.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const resetForm = (): void => {
    setNewProperty({
      title: '',
      description: '',
      price: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      type: 'house',
      status: 'active',
      bedrooms: '',
      bathrooms: '',
      squareFeet: '',
      lotSize: '',
      yearBuilt: '',
      features: '',
      images: []
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false): void => {
    const files = event.target.files;
    if (files) {
      const imageUrls: string[] = [];
      
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            imageUrls.push(e.target.result as string);
            if (imageUrls.length === files.length) {
              if (isEdit && editingProperty) {
                setEditingProperty(prev => prev ? {
                  ...prev,
                  images: [...prev.images, ...imageUrls]
                } : null);
              } else {
                setNewProperty(prev => ({
                  ...prev,
                  images: [...prev.images, ...imageUrls]
                }));
              }
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number, isEdit: boolean = false): void => {
    if (isEdit && editingProperty) {
      setEditingProperty(prev => prev ? {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      } : null);
    } else {
      setNewProperty(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCreateProperty = (): void => {
    if (!newProperty.title || !newProperty.price || !newProperty.address) {
      alert('Please fill in required fields: Title, Price, and Address');
      return;
    }

    const property: Property = {
      id: `PROP-${Date.now()}`,
      title: newProperty.title,
      description: newProperty.description,
      price: parseInt(newProperty.price, 10),
      address: newProperty.address,
      city: newProperty.city,
      state: newProperty.state,
      zipCode: newProperty.zipCode,
      type: newProperty.type,
      status: newProperty.status,
      bedrooms: parseInt(newProperty.bedrooms, 10) || 0,
      bathrooms: parseInt(newProperty.bathrooms, 10) || 0,
      squareFeet: parseInt(newProperty.squareFeet, 10) || 0,
      lotSize: newProperty.lotSize ? parseFloat(newProperty.lotSize) : undefined,
      yearBuilt: parseInt(newProperty.yearBuilt, 10) || new Date().getFullYear(),
      images: newProperty.images.length > 0 ? newProperty.images : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'],
      features: newProperty.features ? newProperty.features.split(',').map(f => f.trim()).filter(f => f) : [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProperties(prev => [property, ...prev]);
    setShowNewPropertyModal(false);
    resetForm();
    alert('Property added successfully!');
  };

  const handleEditProperty = (property: Property): void => {
    setEditingProperty(property);
    setShowEditPropertyModal(true);
  };

  const handleUpdateProperty = (): void => {
    if (!editingProperty) return;

    if (!editingProperty.title || !editingProperty.price || !editingProperty.address) {
      alert('Please fill in required fields: Title, Price, and Address');
      return;
    }

    const updatedProperty: Property = {
      ...editingProperty,
      updatedAt: new Date().toISOString()
    };

    setProperties(prev => prev.map(p => 
      p.id === editingProperty.id ? updatedProperty : p
    ));
    
    setShowEditPropertyModal(false);
    setEditingProperty(null);
    alert('Property updated successfully!');
  };

  const toggleFavorite = (id: string): void => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const deleteProperty = (id: string): void => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleInputChange = (field: keyof NewPropertyForm, value: string): void => {
    setNewProperty(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field: keyof Property, value: any): void => {
    if (editingProperty) {
      setEditingProperty(prev => prev ? ({ ...prev, [field]: value }) : null);
    }
  };

  const PropertyForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const currentProperty = isEdit ? editingProperty : newProperty;
    const currentImages = isEdit ? (editingProperty?.images || []) : newProperty.images;
    
    if (isEdit && !editingProperty) return null;

    return (
      <div className="p-4 space-y-4">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Images
          </label>
          
          {/* Image Preview */}
          {currentImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-3">
              {currentImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Property ${index + 1}`}
                    className="w-full h-20 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(index, isEdit)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload Button */}
          <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e, isEdit)}
              className="hidden"
              id={isEdit ? "edit-image-upload" : "image-upload"}
            />
            <label
              htmlFor={isEdit ? "edit-image-upload" : "image-upload"}
              className="cursor-pointer"
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
              <span className="text-sm text-gray-600">Click to upload images</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={currentProperty?.title || ''}
              onChange={(e) => isEdit 
                ? handleEditInputChange('title', e.target.value)
                : handleInputChange('title', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Modern Family Home"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              value={isEdit ? currentProperty?.price || '' : newProperty.price}
              onChange={(e) => isEdit 
                ? handleEditInputChange('price', parseInt(e.target.value, 10) || 0)
                : handleInputChange('price', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="450000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={currentProperty?.address || ''}
              onChange={(e) => isEdit 
                ? handleEditInputChange('address', e.target.value)
                : handleInputChange('address', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="123 Oak Street"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={currentProperty?.city || ''}
              onChange={(e) => isEdit 
                ? handleEditInputChange('city', e.target.value)
                : handleInputChange('city', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Springfield"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={currentProperty?.state || ''}
              onChange={(e) => isEdit 
                ? handleEditInputChange('state', e.target.value)
                : handleInputChange('state', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="CA"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={currentProperty?.zipCode || ''}
              onChange={(e) => isEdit 
                ? handleEditInputChange('zipCode', e.target.value)
                : handleInputChange('zipCode', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="90210"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={currentProperty?.type || 'house'}
              onChange={(e) => isEdit 
                ? handleEditInputChange('type', e.target.value as Property['type'])
                : handleInputChange('type', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={currentProperty?.status || 'active'}
              onChange={(e) => isEdit 
                ? handleEditInputChange('status', e.target.value as Property['status'])
                : handleInputChange('status', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              {propertyStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
            <input
              type="number"
              value={isEdit ? currentProperty?.bedrooms || '' : newProperty.bedrooms}
              onChange={(e) => isEdit 
                ? handleEditInputChange('bedrooms', parseInt(e.target.value, 10) || 0)
                : handleInputChange('bedrooms', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
            <input
              type="number"
              step="0.5"
              value={isEdit ? (editingProperty?.bathrooms || '') : newProperty.bathrooms}
              onChange={(e) => isEdit 
                ? handleEditInputChange('bathrooms', parseFloat(e.target.value) || 0)
                : handleInputChange('bathrooms', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
            <input
              type="number"
              value={isEdit ? (editingProperty?.squareFeet || '') : newProperty.squareFeet}
              onChange={(e) => isEdit 
                ? handleEditInputChange('squareFeet', parseInt(e.target.value, 10) || 0)
                : handleInputChange('squareFeet', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="1850"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
            <input
              type="number"
              value={isEdit ? (editingProperty?.yearBuilt || '') : newProperty.yearBuilt}
              onChange={(e) => isEdit 
                ? handleEditInputChange('yearBuilt', parseInt(e.target.value, 10) || new Date().getFullYear())
                : handleInputChange('yearBuilt', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="2015"
            />
          </div>
        </div>
          
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={currentProperty?.description || ''}
            onChange={(e) => isEdit 
              ? handleEditInputChange('description', e.target.value)
              : handleInputChange('description', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Beautiful property with modern amenities..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
          <input
            type="text"
            value={isEdit 
              ? (currentProperty && Array.isArray(currentProperty.features) 
                  ? currentProperty.features.join(', ') 
                  : currentProperty?.features || '')
              : newProperty.features
            }
            onChange={(e) => isEdit 
              ? handleEditInputChange('features', e.target.value.split(',').map(f => f.trim()).filter(f => f))
              : handleInputChange('features', e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Garage, Garden, Modern Kitchen"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600">Manage your real estate portfolio and property listings.</p>
          </div>
          
          <button
            onClick={() => setShowNewPropertyModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-blue-600">
                <Home className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averagePrice)}</p>
              </div>
              <div className="text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-orange-600">{stats.favorites}</p>
              </div>
              <div className="text-orange-600">
                <Star className="w-5 h-5" />
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
                placeholder="Search properties by title, address, or city..."
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
              <option value="all">All Status</option>
              {propertyStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Property Type Distribution */}
        <div className="bg-white rounded border p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Type Distribution</h3>
          <div className="grid grid-cols-5 gap-4">
            {propertyTypes.map(type => {
              const count = stats.byType[type.value] || 0;
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

        {/* Properties Display */}
        {filteredProperties.length === 0 ? (
          <div className="bg-white rounded border p-8 text-center">
            <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? 'No matching properties' : 'No properties found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first property'
              }
            </p>
            <button
              onClick={() => setShowNewPropertyModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Property
            </button>
          </div>
        ) : (
          <div className="bg-white rounded border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {statusFilter === 'all' ? 'All Properties' : `${propertyStatuses.find(s => s.value === statusFilter)?.label} Properties`}
                <span className="ml-2 text-sm text-gray-500">({filteredProperties.length})</span>
              </h3>
            </div>
            
            <div className="p-4">
              <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredProperties.map((property) => {
                  const typeInfo = getTypeInfo(property.type);
                  
                  return (
                    <div key={property.id} className={`bg-gray-50 rounded border hover:shadow-sm transition-shadow ${viewMode === 'list' ? 'p-3' : 'p-4'}`}>
                      {viewMode === 'grid' ? (
                        <>
                          <div className="relative mb-3">
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-32 object-cover rounded"
                            />
                            <button
                              onClick={() => toggleFavorite(property.id)}
                              className={`absolute top-2 right-2 p-1 rounded ${
                                property.isFavorite ? 'text-red-500' : 'text-gray-400'
                              }`}
                            >
                              {property.isFavorite ? '❤️' : '🤍'}
                            </button>
                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(property.status)} bg-white`}>
                              {property.status}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{property.title}</h3>
                              <p className="text-lg font-bold text-blue-600">{formatCurrency(property.price)}</p>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span>{property.address}, {property.city}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Bed className="w-3 h-3" />
                                <span>{property.bedrooms}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Bath className="w-3 h-3" />
                                <span>{property.bathrooms}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Square className="w-3 h-3" />
                                <span>{property.squareFeet} sqft</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">
                                <typeInfo.icon className="w-4 h-4" />
                              </span>
                              <span className="text-sm text-gray-600">{typeInfo.label}</span>
                              <span className="text-sm text-gray-400">• {property.yearBuilt}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                            
                            <div className="flex gap-2 pt-2">
                              <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-1 px-2 rounded text-sm flex items-center justify-center gap-1">
                                <Eye className="w-3 h-3" />
                                View
                              </button>
                              <button 
                                onClick={() => handleEditProperty(property)}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-1 px-2 rounded text-sm"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => deleteProperty(property.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 py-1 px-2 rounded text-sm"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <img 
                            src={property.images[0]} 
                            alt={property.title}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-gray-900">{property.title}</h3>
                                <p className="text-lg font-bold text-blue-600">{formatCurrency(property.price)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium ${getStatusColor(property.status)}`}>
                                  {property.status}
                                </span>
                                <button
                                  onClick={() => toggleFavorite(property.id)}
                                  className={`text-sm ${property.isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                                >
                                  {property.isFavorite ? '❤️' : '🤍'}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <span>{property.address}, {property.city}</span>
                              <span>{property.bedrooms} bed • {property.bathrooms} bath • {property.squareFeet} sqft</span>
                              <span>{typeInfo.label}</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1 rounded">
                              <Eye className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleEditProperty(property)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1 rounded"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => deleteProperty(property.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-1 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* New Property Modal */}
        {showNewPropertyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
                  <button
                    onClick={() => {
                      setShowNewPropertyModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <PropertyForm isEdit={false} />
              
              <div className="flex gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowNewPropertyModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProperty}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded font-medium"
                >
                  Add Property
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Property Modal */}
        {showEditPropertyModal && editingProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Edit Property</h2>
                  <button
                    onClick={() => {
                      setShowEditPropertyModal(false);
                      setEditingProperty(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <PropertyForm isEdit={true} />
              
              <div className="flex gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditPropertyModal(false);
                    setEditingProperty(null);
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProperty}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded font-medium"
                >
                  Update Property
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};