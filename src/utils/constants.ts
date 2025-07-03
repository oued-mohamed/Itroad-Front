// ===== 5. src/utils/constants.ts =====
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
} as const;

export const AUTH_CONFIG = {
  JWT_STORAGE_KEY: process.env.REACT_APP_JWT_STORAGE_KEY || 'adherant_token',
  REFRESH_TOKEN_KEY: process.env.REACT_APP_REFRESH_TOKEN_KEY || 'adherant_refresh_token',
} as const;

export const FILE_CONFIG = {
  MAX_FILE_SIZE: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_TYPES: (process.env.REACT_APP_ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx').split(','),
  MAX_FILE_SIZE_MB: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '10485760') / 1024 / 1024,
} as const;

export const APP_CONFIG = {
  NAME: process.env.REACT_APP_NAME || 'Adherant Platform',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  DESCRIPTION: process.env.REACT_APP_DESCRIPTION || 'Document Management Platform',
} as const;

export const FEATURE_FLAGS = {
  ENABLE_REGISTRATION: process.env.REACT_APP_ENABLE_REGISTRATION === 'true',
  ENABLE_PROFILE_EDIT: process.env.REACT_APP_ENABLE_PROFILE_EDIT === 'true',
  ENABLE_DOCUMENT_PREVIEW: process.env.REACT_APP_ENABLE_DOCUMENT_PREVIEW === 'true',
  ENABLE_SEARCH: process.env.REACT_APP_ENABLE_SEARCH === 'true',
  ENABLE_NOTIFICATIONS: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',
} as const;

export const UI_CONFIG = {
  ENABLE_DARK_MODE: process.env.REACT_APP_ENABLE_DARK_MODE === 'true',
  DEFAULT_THEME: process.env.REACT_APP_DEFAULT_THEME || 'light',
  ITEMS_PER_PAGE: parseInt(process.env.REACT_APP_ITEMS_PER_PAGE || '10'),
} as const;

