export interface Agent {
  id: string;
  userId: string; // Reference to User
  licenseNumber: string;
  licenseState: string;
  licenseExpiry: Date;
  specialties: AgentSpecialty[];
  serviceAreas: string[];
  experience: number; // years
  rating: number; // 1-5
  reviewCount: number;
  commission: number; // percentage
  bio: string;
  languages: string[];
  certifications: string[];
  awards: string[];
  socialMedia: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  businessInfo: {
    brokerage: string;
    brokerageAddress: string;
    brokeragePhone: string;
    officePhone?: string;
    fax?: string;
  };
  statistics: {
    totalSales: number;
    totalVolume: number;
    averageDaysOnMarket: number;
    listToSaleRatio: number;
  };
  availability: {
    monday: TimeSlot[];
    tuesday: TimeSlot[];
    wednesday: TimeSlot[];
    thursday: TimeSlot[];
    friday: TimeSlot[];
    saturday: TimeSlot[];
    sunday: TimeSlot[];
  };
  isActive: boolean;
  joinedDate: Date;
  lastActiveDate: Date;
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string; // "17:00"
}

export type AgentSpecialty = 
  | 'residential'
  | 'commercial'
  | 'luxury'
  | 'first-time-buyers'
  | 'investment'
  | 'relocation'
  | 'foreclosure'
  | 'new-construction'
  | 'senior-living'
  | 'vacation-homes';

export interface AgentFilter {
  specialties?: AgentSpecialty[];
  serviceAreas?: string[];
  minRating?: number;
  minExperience?: number;
  languages?: string[];
  certifications?: string[];
}