import React, { useState, useCallback } from 'react';
import { Property } from '../../types/property';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface PropertyUploadFormProps {
  onSubmit: (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>, photos?: File[]) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<Property>;
  className?: string;
}

interface PropertyFormData {
  title: string;
  description: string;
  price: string;
  type: Property['type'];
  status: Property['status'];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  details: {
    bedrooms: string;
    bathrooms: string;
    sqft: string;
    lotSize: string;
    yearBuilt: string;
    garage: string;
    stories: string;
  };
  features: string;
  virtualTourUrl: string;
  mls: string;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

export const PropertyUploadForm: React.FC<PropertyUploadFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  className = ''
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    type: initialData?.type || 'house',
    status: initialData?.status || 'active',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      zipCode: initialData?.address?.zipCode || '',
      country: initialData?.address?.country || 'US',
    },
    details: {
      bedrooms: initialData?.details?.bedrooms?.toString() || '',
      bathrooms: initialData?.details?.bathrooms?.toString() || '',
      sqft: initialData?.details?.sqft?.toString() || '',
      lotSize: initialData?.details?.lotSize?.toString() || '',
      yearBuilt: initialData?.details?.yearBuilt?.toString() || '',
      garage: initialData?.details?.garage?.toString() || '',
      stories: initialData?.details?.stories?.toString() || '',
    },
    features: initialData?.features?.join(', ') || '',
    virtualTourUrl: initialData?.virtualTourUrl || '',
    mls: initialData?.mls || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const currentParent = prev[parent as keyof PropertyFormData];
        return {
          ...prev,
          [parent]: {
            ...(currentParent && typeof currentParent === 'object' ? currentParent : {}),
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handlePhotoSelect = useCallback((files: FileList) => {
    const newPhotos: PhotoPreview[] = [];
    const maxPhotos = 20;

    for (let i = 0; i < files.length && selectedPhotos.length + newPhotos.length < maxPhotos; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      // Check for duplicates
      const isDuplicate = selectedPhotos.some((p: PhotoPreview) => 
        p.file.name === file.name && p.file.size === file.size
      );

      if (isDuplicate) {
        continue;
      }

      const preview = URL.createObjectURL(file);
      newPhotos.push({
        file,
        preview
      });
    }

    setSelectedPhotos(prev => [...prev, ...newPhotos]);
  }, [selectedPhotos]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handlePhotoSelect(e.dataTransfer.files);
  }, [handlePhotoSelect]);

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => {
      const updated = [...prev];
      if (updated[index].preview) {
        URL.revokeObjectURL(updated[index].preview);
      }
      updated.splice(index, 1);
      return updated;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) newErrors.price = 'Price is required';
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'ZIP code is required';

    // Price validation
    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        type: formData.type,
        status: formData.status,
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          zipCode: formData.address.zipCode.trim(),
          country: formData.address.country.trim(),
        },
        details: {
          bedrooms: formData.details.bedrooms ? Number(formData.details.bedrooms) : undefined,
          bathrooms: formData.details.bathrooms ? Number(formData.details.bathrooms) : undefined,
          sqft: formData.details.sqft ? Number(formData.details.sqft) : undefined,
          lotSize: formData.details.lotSize ? Number(formData.details.lotSize) : undefined,
          yearBuilt: formData.details.yearBuilt ? Number(formData.details.yearBuilt) : undefined,
          garage: formData.details.garage ? Number(formData.details.garage) : undefined,
          stories: formData.details.stories ? Number(formData.details.stories) : undefined,
        },
        features: formData.features ? formData.features.split(',').map((f: string) => f.trim()).filter((f: string) => f) : [],
        photos: [], // Will be populated after photo upload
        agentId: '', // Will be set by the backend
        virtualTourUrl: formData.virtualTourUrl.trim() || undefined,
        mls: formData.mls.trim() || undefined,
        listingDate: new Date(),
      };

      const photos = selectedPhotos.map((p: PhotoPreview) => p.file);
      await onSubmit(propertyData, photos);
      
    } catch (error) {
      console.error('Error submitting property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Property' : 'Add New Property'}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Input
              label="Property Title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
              required
              placeholder="Beautiful 3BR/2BA Family Home"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the property features, location, and highlights..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                error={errors.price}
                required
                placeholder="450000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="off-market">Off Market</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <Input
                label="Street Address"
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                error={errors['address.street']}
                required
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Input
                  label="City"
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  error={errors['address.city']}
                  required
                  placeholder="City"
                />
              </div>
              <div>
                <Input
                  label="State"
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  error={errors['address.state']}
                  required
                  placeholder="State"
                />
              </div>
              <div>
                <Input
                  label="ZIP Code"
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  error={errors['address.zipCode']}
                  required
                  placeholder="12345"
                />
              </div>
              <div>
                <Input
                  label="Country"
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="US"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Input
                label="Bedrooms"
                type="number"
                value={formData.details.bedrooms}
                onChange={(e) => handleInputChange('details.bedrooms', e.target.value)}
                placeholder="3"
                min="0"
              />
            </div>
            <div>
              <Input
                label="Bathrooms"
                type="number"
                value={formData.details.bathrooms}
                onChange={(e) => handleInputChange('details.bathrooms', e.target.value)}
                placeholder="2"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <Input
                label="Square Feet"
                type="number"
                value={formData.details.sqft}
                onChange={(e) => handleInputChange('details.sqft', e.target.value)}
                placeholder="2000"
                min="0"
              />
            </div>
            <div>
              <Input
                label="Lot Size (sqft)"
                type="number"
                value={formData.details.lotSize}
                onChange={(e) => handleInputChange('details.lotSize', e.target.value)}
                placeholder="8000"
                min="0"
              />
            </div>
            <div>
              <Input
                label="Year Built"
                type="number"
                value={formData.details.yearBuilt}
                onChange={(e) => handleInputChange('details.yearBuilt', e.target.value)}
                placeholder="2000"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <Input
                label="Garage Spaces"
                type="number"
                value={formData.details.garage}
                onChange={(e) => handleInputChange('details.garage', e.target.value)}
                placeholder="2"
                min="0"
              />
            </div>
            <div>
              <Input
                label="Stories"
                type="number"
                value={formData.details.stories}
                onChange={(e) => handleInputChange('details.stories', e.target.value)}
                placeholder="2"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Features and Additional Info */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Features & Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <textarea
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hardwood floors, granite countertops, stainless steel appliances..."
              />
              <p className="mt-1 text-sm text-gray-500">Separate features with commas</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Virtual Tour URL"
                  type="url"
                  value={formData.virtualTourUrl}
                  onChange={(e) => handleInputChange('virtualTourUrl', e.target.value)}
                  placeholder="https://example.com/virtual-tour"
                />
              </div>
              <div>
                <Input
                  label="MLS Number"
                  type="text"
                  value={formData.mls}
                  onChange={(e) => handleInputChange('mls', e.target.value)}
                  placeholder="MLS123456"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Photos</h3>
          
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-gray-600">
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">Upload photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handlePhotoSelect(e.target.files)}
                    className="hidden"
                  />
                </label>
                <span> or drag and drop</span>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB each (max 20 photos)
              </p>
            </div>
          </div>

          {/* Photo Previews */}
          {selectedPhotos.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Selected Photos ({selectedPhotos.length}/20)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {selectedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Property' : 'Create Property')}
          </Button>
        </div>
      </form>
    </div>
  );
};