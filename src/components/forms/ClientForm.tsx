import React, { useState, useEffect } from 'react';
import { Client } from '../../types/client';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ClientFormProps {
  onSubmit: (clientData: Omit<Client, 'id' | 'assignedDate' | 'notes' | 'propertyInterests' | 'viewedProperties' | 'transactions'>) => Promise<void>;
  onClose: () => void;
  initialData?: Partial<Client>;
  className?: string;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: Client['type'];
  status: Client['status'];
  source: Client['source'];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  budget: {
    min: string;
    max: string;
    preApproved: boolean;
    lenderInfo: string;
  };
  timeline: {
    urgency: 'immediate' | 'within-month' | 'within-3-months' | 'within-6-months' | 'no-rush';
    moveInDate: string;
    listingDate: string;
  };
  preferences: {
    propertyType: string[];
    minBedrooms: string;
    maxBedrooms: string;
    minBathrooms: string;
    maxBathrooms: string;
    minSqft: string;
    maxSqft: string;
    features: string;
    locations: string;
    mustHave: string;
    dealBreakers: string;
  };
  tags: string;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  className = ''
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    type: initialData?.type || 'buyer',
    status: initialData?.status || 'active',
    source: initialData?.source || 'referral',
    address: {
      street: initialData?.address?.street || '',
      city: initialData?.address?.city || '',
      state: initialData?.address?.state || '',
      zipCode: initialData?.address?.zipCode || '',
      country: initialData?.address?.country || 'US',
    },
    budget: {
      min: initialData?.budget?.min?.toString() || '',
      max: initialData?.budget?.max?.toString() || '',
      preApproved: initialData?.budget?.preApproved || false,
      lenderInfo: initialData?.budget?.lenderInfo || '',
    },
    timeline: {
      urgency: (initialData?.timeline?.urgency as 'immediate' | 'within-month' | 'within-3-months' | 'within-6-months' | 'no-rush') || 'within-3-months',
      moveInDate: initialData?.timeline?.moveInDate ? new Date(initialData.timeline.moveInDate).toISOString().split('T')[0] : '',
      listingDate: initialData?.timeline?.listingDate ? new Date(initialData.timeline.listingDate).toISOString().split('T')[0] : '',
    },
    preferences: {
      propertyType: [],
      minBedrooms: initialData?.preferences?.bedrooms?.min?.toString() || '',
      maxBedrooms: initialData?.preferences?.bedrooms?.max?.toString() || '',
      minBathrooms: initialData?.preferences?.bathrooms?.min?.toString() || '',
      maxBathrooms: initialData?.preferences?.bathrooms?.max?.toString() || '',
      minSqft: initialData?.preferences?.sqft?.min?.toString() || '',
      maxSqft: initialData?.preferences?.sqft?.max?.toString() || '',
      features: initialData?.preferences?.features?.join(', ') || '',
      locations: initialData?.preferences?.locations?.join(', ') || '',
      mustHave: initialData?.preferences?.mustHave?.join(', ') || '',
      dealBreakers: initialData?.preferences?.dealBreakers?.join(', ') || '',
    },
    tags: initialData?.tags?.join(', ') || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const currentParent = prev[parent as keyof ClientFormData];
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

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    const currentArray = (formData.preferences as any)[field] || [];
    let updatedArray: string[];
    
    if (checked) {
      updatedArray = [...currentArray, value];
    } else {
      updatedArray = currentArray.filter((item: string) => item !== value);
    }
    
    handleInputChange(`preferences.${field}`, updatedArray);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const clientData: Omit<Client, 'id' | 'assignedDate' | 'notes' | 'propertyInterests' | 'viewedProperties' | 'transactions'> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        type: formData.type,
        status: formData.status,
        source: formData.source,
        agentId: '', // Will be set by the backend
        lastContactDate: undefined,
        nextFollowUpDate: undefined,
        address: formData.address.street ? {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          zipCode: formData.address.zipCode.trim(),
          country: formData.address.country.trim(),
        } : undefined,
        budget: (formData.budget.min || formData.budget.max) ? {
          min: formData.budget.min ? Number(formData.budget.min) : 0,
          max: formData.budget.max ? Number(formData.budget.max) : 0,
          preApproved: formData.budget.preApproved,
          lenderInfo: formData.budget.lenderInfo.trim() || undefined,
        } : undefined,
        timeline: {
          urgency: formData.timeline.urgency,
          moveInDate: formData.timeline.moveInDate ? new Date(formData.timeline.moveInDate) : undefined,
          listingDate: formData.timeline.listingDate ? new Date(formData.timeline.listingDate) : undefined,
        },
        preferences: {
          propertyType: formData.preferences.propertyType as any,
          bedrooms: {
            min: formData.preferences.minBedrooms ? Number(formData.preferences.minBedrooms) : 0,
            max: formData.preferences.maxBedrooms ? Number(formData.preferences.maxBedrooms) : 10,
          },
          bathrooms: {
            min: formData.preferences.minBathrooms ? Number(formData.preferences.minBathrooms) : 0,
            max: formData.preferences.maxBathrooms ? Number(formData.preferences.maxBathrooms) : 10,
          },
          sqft: (formData.preferences.minSqft || formData.preferences.maxSqft) ? {
            min: formData.preferences.minSqft ? Number(formData.preferences.minSqft) : 0,
            max: formData.preferences.maxSqft ? Number(formData.preferences.maxSqft) : 10000,
          } : undefined,
          features: formData.preferences.features ? 
            formData.preferences.features.split(',').map((f: string) => f.trim()).filter((f: string) => f) : [],
          locations: formData.preferences.locations ? 
            formData.preferences.locations.split(',').map((l: string) => l.trim()).filter((l: string) => l) : [],
          mustHave: formData.preferences.mustHave ? 
            formData.preferences.mustHave.split(',').map((m: string) => m.trim()).filter((m: string) => m) : [],
          dealBreakers: formData.preferences.dealBreakers ? 
            formData.preferences.dealBreakers.split(',').map((d: string) => d.trim()).filter((d: string) => d) : [],
        },
        tags: formData.tags ? 
          formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [],
      };

      await onSubmit(clientData);
      
    } catch (error) {
      console.error('Error submitting client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Client' : 'Add New Client'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="First Name"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={errors.firstName}
              required
            />
          </div>
          <div>
            <Input
              label="Last Name"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={errors.lastName}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              required
            />
          </div>
          <div>
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={errors.phone}
              required
            />
          </div>
        </div>

        {/* Client Type and Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
              <option value="renter">Renter</option>
              <option value="landlord">Landlord</option>
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
              <option value="inactive">Inactive</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="referral">Referral</option>
              <option value="website">Website</option>
              <option value="social-media">Social Media</option>
              <option value="advertisement">Advertisement</option>
              <option value="walk-in">Walk-in</option>
              <option value="cold-call">Cold Call</option>
            </select>
          </div>
        </div>

        {/* Budget Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Minimum Budget"
                type="number"
                value={formData.budget.min}
                onChange={(e) => handleInputChange('budget.min', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Input
                label="Maximum Budget"
                type="number"
                value={formData.budget.max}
                onChange={(e) => handleInputChange('budget.max', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.budget.preApproved}
                onChange={(e) => handleInputChange('budget.preApproved', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Pre-approved for mortgage</span>
            </label>
          </div>
          <div className="mt-4">
            <Input
              label="Lender Information"
              type="text"
              value={formData.budget.lenderInfo}
              onChange={(e) => handleInputChange('budget.lenderInfo', e.target.value)}
              placeholder="Lender name or contact information"
            />
          </div>
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
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Client' : 'Create Client')}
          </Button>
        </div>
      </form>
    </div>
  );
  
};
