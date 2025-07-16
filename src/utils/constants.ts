// src/utils/constants.ts - Updated with correct service URLs

// Environment detection - simplified for browser compatibility
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '0.0.0.0';

// App Configuration
export const APP_CONFIG = {
  NAME: '',
  VERSION: '1.0.0',
  DESCRIPTION: 'Secure Document Management Platform',
  COMPANY: 'Adherant',
  SUPPORT_EMAIL: 'support@adherant.com',
  PRIVACY_POLICY_URL: '/privacy',
  TERMS_OF_SERVICE_URL: '/terms',
  CONTACT_URL: '/contact',
};

// API Configuration - Updated with correct service ports
export const API_CONFIG = {
  // Main API base for auth (keep this for auth endpoints)
  BASE_URL: 'http://localhost:3001/api',
  TIMEOUT: 30000,
  VERSION: 'v1',
  
  // Service-specific URLs
  SERVICES: {
    AUTH: 'http://localhost:3001/api',
    DOCUMENTS: 'http://localhost:3002/api',
    PROPERTIES: 'http://localhost:3004/api',
    CLIENTS: 'http://localhost:3004/api',  // Points to property service temporarily
    TRANSACTIONS: 'http://localhost:3005/api',
  },
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
    DOCUMENTS: {
      LIST: '/documents',
      UPLOAD: '/documents/upload',
      DELETE: (id: string) => `/documents/${id}`,
      DOWNLOAD: (id: string) => `/documents/${id}/download`,
    },
    PROPERTIES: {
      LIST: '/properties',
      CREATE: '/properties',
      GET: (id: string) => `/properties/${id}`,
      UPDATE: (id: string) => `/properties/${id}`,
      DELETE: (id: string) => `/properties/${id}`,
      SEARCH: '/properties/search',
      FAVORITES: '/properties/favorites',
    },
    CLIENTS: {
      LIST: '/clients',
      CREATE: '/clients',
      GET: (id: string) => `/clients/${id}`,
      UPDATE: (id: string) => `/clients/${id}`,
      DELETE: (id: string) => `/clients/${id}`,
      STATS: '/clients/stats',
    },
    TRANSACTIONS: {
      LIST: '/transactions',
      CREATE: '/transactions',
      GET: (id: string) => `/transactions/${id}`,
      UPDATE: (id: string) => `/transactions/${id}`,
      DELETE: (id: string) => `/transactions/${id}`,
      STATS: '/transactions/stats',
    },
    PROFILE: {
      GET: '/profile',
      UPDATE: '/profile',
    }
  }
};

// Auth Configuration  
export const AUTH_CONFIG = {
  JWT_STORAGE_KEY: 'adherant_token',
  USER_STORAGE_KEY: 'adherant_user',
  REFRESH_TOKEN_KEY: 'adherant_refresh_token',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
};

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 250,
  HEADER_HEIGHT: 64,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50, 100],
  },
  THEME: {
    PRIMARY_COLOR: '#3B82F6',
    SECONDARY_COLOR: '#64748B',
    SUCCESS_COLOR: '#10B981',
    ERROR_COLOR: '#EF4444',
    WARNING_COLOR: '#F59E0B',
  }
};

// Document Categories
export const DOCUMENT_CATEGORIES = [
  { value: 'identity', label: 'Identity Documents' },
  { value: 'medical', label: 'Medical Records' },
  { value: 'education', label: 'Education Certificates' },
  { value: 'employment', label: 'Employment Documents' },
  { value: 'financial', label: 'Financial Records' },
  { value: 'other', label: 'Other Documents' },
];

// Theme Configuration
export const THEME_CONFIG = {
  STORAGE_KEY: 'adherant_theme',
  DEFAULT_THEME: 'light',
  THEMES: ['light', 'dark'] as const,
};

// Route Configuration
export const ROUTES_CONFIG = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DOCUMENTS: '/documents',
  PROPERTIES: '/properties',
  CLIENTS: '/clients',
  TRANSACTIONS: '/transactions',
  ANALYTICS: '/analytics',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  NOT_FOUND: '/404',
};

// Validation Rules
export const VALIDATION_CONFIG = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  DOCUMENT: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_FILES_PER_UPLOAD: 5,
    ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  }
};

// Debug logging - always show in development
console.log('🚨 API CONFIG DEBUG:');
console.log('🔧 Hostname:', window.location.hostname);
console.log('🔧 Is Localhost:', isLocalhost);
console.log('🔧 AUTH API:', API_CONFIG.SERVICES.AUTH);
console.log('🔧 PROPERTIES API:', API_CONFIG.SERVICES.PROPERTIES);
console.log('🔧 CLIENTS API:', API_CONFIG.SERVICES.CLIENTS);
console.log('🔧 TRANSACTIONS API:', API_CONFIG.SERVICES.TRANSACTIONS);
console.log('🚨 END DEBUG');

// Make API_CONFIG available globally for debugging
(window as any).API_CONFIG = API_CONFIG;