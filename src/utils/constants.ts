// src/utils/constants.ts - Updated for API Gateway pattern

// Environment detection - simplified for browser compatibility
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '0.0.0.0';

// App Configuration
export const APP_CONFIG = {
  NAME: 'Adherant',
  VERSION: '1.0.0',
  DESCRIPTION: 'Secure Document Management Platform',
  COMPANY: 'Adherant',
  SUPPORT_EMAIL: 'support@adherant.com',
  PRIVACY_POLICY_URL: '/privacy',
  TERMS_OF_SERVICE_URL: '/terms',
  CONTACT_URL: '/contact',
};

// API Configuration - Updated for API Gateway pattern
export const API_CONFIG = {
  // ALL requests go through API Gateway on port 3001
  BASE_URL: 'http://localhost:3001',
  TIMEOUT: 30000,
  VERSION: 'v1',
  
  // API Endpoints - All routed through API Gateway
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    DOCUMENTS: {
      LIST: '/api/documents',
      UPLOAD: '/api/documents/upload',
      DELETE: (id: string) => `/api/documents/${id}`,
      DOWNLOAD: (id: string) => `/api/documents/${id}/download`,
    },
    PROPERTIES: {
      LIST: '/api/properties',
      CREATE: '/api/properties',
      GET: (id: string) => `/api/properties/${id}`,
      UPDATE: (id: string) => `/api/properties/${id}`,
      DELETE: (id: string) => `/api/properties/${id}`,
      SEARCH: '/api/properties/search',
      FAVORITES: '/api/properties/favorites',
    },
    PROFILES: {
      LIST: '/api/profiles',
      CREATE: '/api/profiles',
      GET: (id: string) => `/api/profiles/${id}`,
      UPDATE: (id: string) => `/api/profiles/${id}`,
      DELETE: (id: string) => `/api/profiles/${id}`,
      STATS: '/api/profiles/stats',
    },
    TRANSACTIONS: {
      LIST: '/api/transactions',
      CREATE: '/api/transactions',
      GET: (id: string) => `/api/transactions/${id}`,
      UPDATE: (id: string) => `/api/transactions/${id}`,
      DELETE: (id: string) => `/api/transactions/${id}`,
      STATS: '/api/transactions/stats',
    },
    PROFILE: {
      GET: '/api/profile',
      UPDATE: '/api/profile',
    }
  },

  // Legacy service URLs (for backward compatibility if needed)
  SERVICES: {
    AUTH: 'http://localhost:3001/api/auth',
    DOCUMENTS: 'http://localhost:3001/api/documents',
    PROPERTIES: 'http://localhost:3001/api/properties',
    CLIENTS: 'http://localhost:3001/api/profiles',  // Renamed to profiles
    TRANSACTIONS: 'http://localhost:3001/api/transactions',
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
console.log('🚨 API CONFIG DEBUG (API Gateway Pattern):');
console.log('🔧 Hostname:', window.location.hostname);
console.log('🔧 Is Localhost:', isLocalhost);
console.log('🔧 API Gateway Base URL:', API_CONFIG.BASE_URL);
console.log('🔧 Auth Endpoint:', API_CONFIG.ENDPOINTS.AUTH.REGISTER);
console.log('🔧 Properties Endpoint:', API_CONFIG.ENDPOINTS.PROPERTIES.LIST);
console.log('🔧 Profiles Endpoint:', API_CONFIG.ENDPOINTS.PROFILES.LIST);
console.log('🔧 Transactions Endpoint:', API_CONFIG.ENDPOINTS.TRANSACTIONS.LIST);
console.log('🚨 END DEBUG');

// Make API_CONFIG available globally for debugging
(window as any).API_CONFIG = API_CONFIG;