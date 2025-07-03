// ===== 4. src/types/document.ts =====
export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  userId: string;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
}

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

// ===== 6. src/services/api.ts =====
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../utils/constants';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem(AUTH_CONFIG.JWT_STORAGE_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem(AUTH_CONFIG.JWT_STORAGE_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  public get instance() {
    return this.api;
  }
}

export const apiService = new ApiService();
export default apiService.instance;

// ===== 7. src/services/auth.ts =====
import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '../types/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyToken(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }
};

// ===== 8. src/services/document.ts =====
import api from './api';
import { Document, UploadProgress } from '../types/document';

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    const response = await api.get('/documents');
    return response.data;
  },

  async uploadDocument(file: File, onProgress?: (progress: UploadProgress) => void): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            fileId: file.name,
            progress,
            status: 'uploading'
          });
        }
      },
    });
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },

  async downloadDocument(id: string): Promise<Blob> {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }
};

// ===== 9. src/contexts/AuthContext.tsx =====
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, LoginCredentials, RegisterData, User } from '../types/auth';
import { authService } from '../services/auth';
import { AUTH_CONFIG } from '../utils/constants';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.login(credentials);
      localStorage.setItem(AUTH_CONFIG.JWT_STORAGE_KEY, response.token);
      dispatch({ type: 'SET_USER', payload: { user: response.user, token: response.token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await authService.register(data);
      localStorage.setItem(AUTH_CONFIG.JWT_STORAGE_KEY, response.token);
      dispatch({ type: 'SET_USER', payload: { user: response.user, token: response.token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_CONFIG.JWT_STORAGE_KEY);
    authService.logout().catch(() => {}); // Fire and forget
    dispatch({ type: 'CLEAR_USER' });
  };

  // Check for existing token on app start
  useEffect(() => {
    const token = localStorage.getItem(AUTH_CONFIG.JWT_STORAGE_KEY);
    if (token) {
      // Verify token and get user info
      authService.verifyToken().then((user) => {
        dispatch({ type: 'SET_USER', payload: { user, token } });
      }).catch(() => {
        logout();
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ===== 10. src/components/common/Button.tsx =====
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// ===== 11. src/components/common/Input.tsx =====
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300'
          } ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

// ===== 12. src/components/common/Loading.tsx =====
import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <svg
        className={`animate-spin ${sizeClasses[size]} text-blue-600`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
};