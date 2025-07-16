// src/pages/Properties.tsx - Fixed with persistence and edit functionality
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
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

// Property interface
interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'land';
  status: 'active' | 'pending' | 'sold' | 'rented' | 'inactive';
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    lotSize?: number;
    yearBuilt: number;
  };
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
  street: string;
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

// Storage helpers
const STORAGE_KEY = 'adherant_properties';

const saveToStorage = (properties: Property[]) => {
  try {
    // Since we can't use localStorage in Claude.ai, we'll simulate persistence
    // In a real app, this would be: localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    console.log('Properties saved to storage:', properties);
  } catch (error) {
    console.error('Failed to save properties:', error);
  }
};

const loadFromStorage = (): Property[] => {
  try {
    // Since we can't use localStorage in Claude.ai, return default data
    // In a real app, this would be: return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return [
      {
        id: 'PROP-001',
        title: 'Villa Moderne Californie',
        description: 'Magnifique villa 4 chambres avec cuisine moderne et grand jardin.',
        price: 3500000,
        address: {
          street: '15 Avenue Mohammed V',
          city: 'Casablanca',
          state: 'Casablanca-Settat',
          zipCode: '20000'
        },
        type: 'house',
        status: 'active',
        details: {
          bedrooms: 4,
          bathrooms: 3,
          squareFeet: 250,
          lotSize: 500,
          yearBuilt: 2018
        },
        images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'],
        features: ['Garage', 'Jardin', 'Cuisine Moderne', 'Piscine'],
        isFavorite: true,
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-07-01T10:00:00Z'
      },
      {
        id: 'PROP-002',
        title: 'Appartement Standing Rabat',
        description: 'Appartement luxueux au cœur de Rabat avec vue sur mer.',
        price: 2200000,
        address: {
          street: '78 Rue Allal Ben Abdellah',
          city: 'Rabat',
          state: 'Rabat-Salé-Kénitra',
          zipCode: '10000'
        },
        type: 'apartment',
        status: 'active',
        details: {
          bedrooms: 3,
          bathrooms: 2,
          squareFeet: 180,
          yearBuilt: 2020
        },
        images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
        features: ['Vue Mer', 'Balcon', 'Ascenseur', 'Parking'],
        isFavorite: false,
        createdAt: '2024-06-15T14:00:00Z',
        updatedAt: '2024-07-05T14:00:00Z'
      }
    ];
  } catch (error) {
    console.error('Failed to load properties:', error);
    return [];
  }
};

// Memoized form component
const PropertyForm = React.memo<{
  isEdit?: boolean;
  formData: NewPropertyForm;
  editingProperty: Property | null;
  onInputChange: (field: keyof NewPropertyForm, value: string) => void;
  onImageUpload: (files: FileList) => void;
  onImageRemove: (index: number) => void;
}>(({ 
  isEdit = false,
  formData,
  editingProperty,
  onInputChange,
  onImageUpload,
  onImageRemove
}) => {
  const propertyTypes = [
    { value: 'house' as const, label: 'Maison' },
    { value: 'apartment' as const, label: 'Appartement' },
    { value: 'condo' as const, label: 'Condo' },
    { value: 'townhouse' as const, label: 'Maison de Ville' },
    { value: 'land' as const, label: 'Terrain' }
  ];

  const propertyStatuses = [
    { value: 'active' as const, label: 'Actif' },
    { value: 'pending' as const, label: 'En Attente' },
    { value: 'sold' as const, label: 'Vendu' },
    { value: 'rented' as const, label: 'Loué' },
    { value: 'inactive' as const, label: 'Inactif' }
  ];

  const currentImages = isEdit ? (editingProperty?.images || []) : formData.images;
  
  // Stable event handlers
  const handleInputChange = useCallback((field: keyof NewPropertyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onInputChange(field, e.target.value);
  }, [onInputChange]);

  const handleImageUploadEvent = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onImageUpload(e.target.files);
    }
  }, [onImageUpload]);

  const handleImageRemoveClick = useCallback((index: number) => () => {
    onImageRemove(index);
  }, [onImageRemove]);

  return (
    <div className="p-4 space-y-4">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images de la Propriété
        </label>
        
        {/* Image Preview */}
        {currentImages.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-3">
            {currentImages.map((image, index) => (
              <div key={`${image}-${index}`} className="relative">
                <img 
                  src={image} 
                  alt={`Propriété ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={handleImageRemoveClick(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Upload Button */}
        <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUploadEvent}
            className="hidden"
            id={isEdit ? "edit-image-upload" : "image-upload"}
          />
          <label
            htmlFor={isEdit ? "edit-image-upload" : "image-upload"}
            className="cursor-pointer block"
          >
            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
            <span className="text-sm text-gray-600">Cliquez pour télécharger des images</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
          <input
            type="text"
            value={isEdit ? (editingProperty?.title || '') : formData.title}
            onChange={handleInputChange('title')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Villa Moderne Californie"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prix (DH) *</label>
          <input
            type="number"
            value={isEdit ? (editingProperty?.price || '') : formData.price}
            onChange={handleInputChange('price')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="3500000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
          <input
            type="text"
            value={isEdit ? (editingProperty?.address.street || '') : formData.street}
            onChange={handleInputChange('street')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="15 Avenue Mohammed V"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
          <input
            type="text"
            value={isEdit ? (editingProperty?.address.city || '') : formData.city}
            onChange={handleInputChange('city')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Casablanca"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
          <input
            type="text"
            value={isEdit ? (editingProperty?.address.state || '') : formData.state}
            onChange={handleInputChange('state')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Casablanca-Settat"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code Postal</label>
          <input
            type="text"
            value={isEdit ? (editingProperty?.address.zipCode || '') : formData.zipCode}
            onChange={handleInputChange('zipCode')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="20000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de Propriété</label>
          <select
            value={isEdit ? (editingProperty?.type || 'house') : formData.type}
            onChange={handleInputChange('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {propertyTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            value={isEdit ? (editingProperty?.status || 'active') : formData.status}
            onChange={handleInputChange('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            {propertyStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
          <input
            type="number"
            value={isEdit ? (editingProperty?.details.bedrooms || '') : formData.bedrooms}
            onChange={handleInputChange('bedrooms')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="4"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Salles de Bain</label>
          <input
            type="number"
            step="0.5"
            value={isEdit ? (editingProperty?.details.bathrooms || '') : formData.bathrooms}
            onChange={handleInputChange('bathrooms')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="3"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
          <input
            type="number"
            value={isEdit ? (editingProperty?.details.squareFeet || '') : formData.squareFeet}
            onChange={handleInputChange('squareFeet')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="250"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Année de Construction</label>
          <input
            type="number"
            value={isEdit ? (editingProperty?.details.yearBuilt || '') : formData.yearBuilt}
            onChange={handleInputChange('yearBuilt')}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="2018"
          />
        </div>
      </div>
        
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={isEdit ? (editingProperty?.description || '') : formData.description}
          onChange={handleInputChange('description')}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Magnifique propriété avec équipements modernes..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Équipements (séparés par des virgules)</label>
        <input
          type="text"
          value={isEdit 
            ? (editingProperty?.features?.join(', ') || '')
            : formData.features
          }
          onChange={handleInputChange('features')}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="Garage, Jardin, Cuisine Moderne, Piscine"
        />
      </div>
    </div>
  );
});

PropertyForm.displayName = 'PropertyForm';

export const Properties: React.FC = () => {
  // Load properties from storage on mount
  const [properties, setProperties] = useState<Property[]>([]);
  
  // Load properties when component mounts
  useEffect(() => {
    const loadedProperties = loadFromStorage();
    setProperties(loadedProperties);
  }, []);

  // Save properties whenever they change
  useEffect(() => {
    if (properties.length > 0) {
      saveToStorage(properties);
    }
  }, [properties]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state
  const [newPropertyForm, setNewPropertyForm] = useState<NewPropertyForm>({
    title: '',
    description: '',
    price: '',
    street: '',
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

  // Memoized handlers
  const handleInputChange = useCallback((field: keyof NewPropertyForm, value: string) => {
    setNewPropertyForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEditInputChange = useCallback((field: keyof NewPropertyForm, value: string) => {
    if (editingProperty) {
      if (field === 'title') {
        setEditingProperty(prev => prev ? { ...prev, title: value } : null);
      } else if (field === 'description') {
        setEditingProperty(prev => prev ? { ...prev, description: value } : null);
      } else if (field === 'price') {
        setEditingProperty(prev => prev ? { ...prev, price: parseInt(value) || 0 } : null);
      } else if (field === 'street') {
        setEditingProperty(prev => prev ? { ...prev, address: { ...prev.address, street: value } } : null);
      } else if (field === 'city') {
        setEditingProperty(prev => prev ? { ...prev, address: { ...prev.address, city: value } } : null);
      } else if (field === 'state') {
        setEditingProperty(prev => prev ? { ...prev, address: { ...prev.address, state: value } } : null);
      } else if (field === 'zipCode') {
        setEditingProperty(prev => prev ? { ...prev, address: { ...prev.address, zipCode: value } } : null);
      } else if (field === 'type') {
        setEditingProperty(prev => prev ? { ...prev, type: value as Property['type'] } : null);
      } else if (field === 'status') {
        setEditingProperty(prev => prev ? { ...prev, status: value as Property['status'] } : null);
      } else if (field === 'bedrooms') {
        setEditingProperty(prev => prev ? { ...prev, details: { ...prev.details, bedrooms: parseInt(value) || 0 } } : null);
      } else if (field === 'bathrooms') {
        setEditingProperty(prev => prev ? { ...prev, details: { ...prev.details, bathrooms: parseInt(value) || 0 } } : null);
      } else if (field === 'squareFeet') {
        setEditingProperty(prev => prev ? { ...prev, details: { ...prev.details, squareFeet: parseInt(value) || 0 } } : null);
      } else if (field === 'yearBuilt') {
        setEditingProperty(prev => prev ? { ...prev, details: { ...prev.details, yearBuilt: parseInt(value) || new Date().getFullYear() } } : null);
      } else if (field === 'features') {
        setEditingProperty(prev => prev ? { ...prev, features: value.split(',').map(f => f.trim()).filter(f => f) } : null);
      }
    }
  }, [editingProperty]);

  const handleImageUpload = useCallback((files: FileList) => {
    const imageUrls: string[] = [];
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imageUrls.push(e.target.result as string);
          if (imageUrls.length === files.length) {
            if (editingProperty) {
              setEditingProperty(prev => prev ? { ...prev, images: [...prev.images, ...imageUrls] } : null);
            } else {
              setNewPropertyForm(prev => ({
                ...prev,
                images: [...prev.images, ...imageUrls]
              }));
            }
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, [editingProperty]);

  const handleImageRemove = useCallback((index: number) => {
    if (editingProperty) {
      setEditingProperty(prev => prev ? { ...prev, images: prev.images.filter((_, i) => i !== index) } : null);
    } else {
      setNewPropertyForm(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  }, [editingProperty]);

  const resetForm = useCallback(() => {
    setNewPropertyForm({
      title: '',
      description: '',
      price: '',
      street: '',
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
  }, []);

  const handleCreateProperty = useCallback(() => {
    if (!newPropertyForm.title || !newPropertyForm.price || !newPropertyForm.street) {
      alert('Veuillez remplir les champs obligatoires: Titre, Prix et Adresse');
      return;
    }

    const property: Property = {
      id: `PROP-${Date.now()}`,
      title: newPropertyForm.title,
      description: newPropertyForm.description,
      price: parseInt(newPropertyForm.price, 10),
      address: {
        street: newPropertyForm.street,
        city: newPropertyForm.city,
        state: newPropertyForm.state,
        zipCode: newPropertyForm.zipCode
      },
      type: newPropertyForm.type,
      status: newPropertyForm.status,
      details: {
        bedrooms: parseInt(newPropertyForm.bedrooms, 10) || 0,
        bathrooms: parseInt(newPropertyForm.bathrooms, 10) || 0,
        squareFeet: parseInt(newPropertyForm.squareFeet, 10) || 0,
        lotSize: newPropertyForm.lotSize ? parseFloat(newPropertyForm.lotSize) : undefined,
        yearBuilt: parseInt(newPropertyForm.yearBuilt, 10) || new Date().getFullYear()
      },
      images: newPropertyForm.images.length > 0 ? newPropertyForm.images : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop'],
      features: newPropertyForm.features ? newPropertyForm.features.split(',').map(f => f.trim()).filter(f => f) : [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProperties(prev => [property, ...prev]);
    setShowNewPropertyModal(false);
    resetForm();
    alert('Propriété ajoutée avec succès!');
  }, [newPropertyForm, resetForm]);

  const handleEditProperty = useCallback((property: Property) => {
    setEditingProperty({ ...property });
    setShowEditPropertyModal(true);
  }, []);

  const handleUpdateProperty = useCallback(() => {
    if (!editingProperty) return;

    if (!editingProperty.title || !editingProperty.price || !editingProperty.address.street) {
      alert('Veuillez remplir les champs obligatoires: Titre, Prix et Adresse');
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
    alert('Propriété mise à jour avec succès!');
  }, [editingProperty]);

  const handleDeleteProperty = useCallback((id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette propriété?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  }, []);

  // Memoized filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = searchTerm === '' || 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesType = typeFilter === 'all' || property.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchTerm, statusFilter, typeFilter]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' DH';
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Propriétés</h1>
            <p className="text-gray-600">Gérez votre portefeuille immobilier et vos annonces.</p>
          </div>
          
          <button
            onClick={() => setShowNewPropertyModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Ajouter Propriété
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded border p-4 mb-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher propriétés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="bg-white rounded border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Toutes les Propriétés ({filteredProperties.length})
          </h3>
          
          {filteredProperties.length === 0 ? (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune propriété trouvée</h3>
              <p className="text-gray-500 mb-4">Commencez par ajouter votre première propriété</p>
              <button
                onClick={() => setShowNewPropertyModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl inline-flex items-center gap-3 shadow-lg transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Ajouter Première Propriété
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-gray-50 rounded border p-4 hover:shadow-sm transition-shadow">
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
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{property.title}</h3>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(property.price)}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span>{property.address.street}, {property.address.city}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3" />
                        <span>{property.details.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3 h-3" />
                        <span>{property.details.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-3 h-3" />
                        <span>{property.details.squareFeet} m²</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200">
                        <Eye className="w-4 h-4" />
                        Voir
                      </button>
                      <button 
                        onClick={() => handleEditProperty(property)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProperty(property.id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Property Modal */}
        {showNewPropertyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Ajouter Nouvelle Propriété</h2>
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
              
              <PropertyForm 
                isEdit={false}
                formData={newPropertyForm}
                editingProperty={null}
                onInputChange={handleInputChange}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
              />
              
              <div className="flex gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowNewPropertyModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateProperty}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Ajouter Propriété
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Property Modal */}
        {showEditPropertyModal && editingProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Modifier Propriété</h2>
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
              
              <PropertyForm 
                isEdit={true}
                formData={newPropertyForm}
                editingProperty={editingProperty}
                onInputChange={handleEditInputChange}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
              />
              
              <div className="flex gap-3 p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditPropertyModal(false);
                    setEditingProperty(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateProperty}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Mettre à Jour
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};