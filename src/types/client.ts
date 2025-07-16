export interface Client {
  id: string;
  userId?: string; // Reference to User if they have an account
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  type: 'buyer' | 'seller' | 'renter' | 'landlord';
  status: 'active' | 'inactive' | 'closed';
  agentId: string;
  assignedDate: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  source: ClientSource;
  preferences?: ClientPreferences;
  budget?: {
    min: number;
    max: number;
    preApproved: boolean;
    lenderInfo?: string;
  };
  timeline?: ClientTimeline;
  notes: ClientNote[];
  tags: string[];
  propertyInterests: string[]; // Property IDs
  viewedProperties: string[]; // Property IDs
  transactions: string[]; // Transaction IDs
}

export interface ClientTimeline {
  urgency: 'immediate' | 'within-month' | 'within-3-months' | 'within-6-months' | 'no-rush';
  moveInDate?: Date;
  listingDate?: Date;
}

export interface ClientPreferences {
  propertyType: ('house' | 'apartment' | 'condo' | 'townhouse')[];
  bedrooms: {
    min: number;
    max: number;
  };
  bathrooms: {
    min: number;
    max: number;
  };
  sqft?: {
    min: number;
    max: number;
  };
  features: string[];
  locations: string[];
  mustHave: string[];
  dealBreakers: string[];
}

export interface ClientNote {
  id: string;
  content: string;
  type: 'general' | 'showing' | 'call' | 'email' | 'meeting' | 'offer';
  agentId: string;
  createdAt: Date;
  isPrivate: boolean;
}

export type ClientSource = 
  | 'referral'
  | 'website'
  | 'social-media'
  | 'open-house'
  | 'cold-call'
  | 'advertisement'
  | 'repeat-client'
  | 'other';

export type ClientUrgency = 'immediate' | 'within-month' | 'within-3-months' | 'within-6-months' | 'no-rush';

export interface ClientFilter {
  type?: Client['type'][];
  status?: Client['status'][];
  agentId?: string;
  source?: ClientSource[];
  search?: string;
  minBudget?: number;
  maxBudget?: number;
  timeline?: ClientUrgency[];
}


export interface ClientSearchParams {
  query?: string;
  page?: number;
  limit?: number;
  filters?: ClientFilter;
}