export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'house' | 'apartment' | 'condo' | 'townhouse' | 'commercial' | 'land';
  status: 'active' | 'pending' | 'sold' | 'rented' | 'off-market';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  details: {
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    lotSize?: number;
    yearBuilt?: number;
    garage?: number;
    stories?: number;
  };
  features: string[];
  photos: string[];
  agentId: string;
  clientId?: string;
  listingDate: Date;
  updatedAt: Date;
  virtualTourUrl?: string;
  mls?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PropertyFilter {
  minPrice?: number;
  maxPrice?: number;
  type?: Property['type'][];
  status?: Property['status'][];
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSqft?: number;
  maxSqft?: number;
  city?: string;
  state?: string;
agentId?: string;
  zipCode?: string;
  features?: string[];
  sortBy?: 'price' | 'date' | 'sqft' | 'bedrooms';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertySearchParams {
  query?: string;
  filters?: PropertyFilter;
  page?: number;
  limit?: number;
}