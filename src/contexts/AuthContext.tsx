// src/contexts/AuthContext.tsx - Improved with better error handling and debugging
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, LoginCredentials, RegisterData, User } from '../types/auth';
import { authService } from '../services/auth';
import { AUTH_CONFIG } from '../utils/constants';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_ERROR'; payload: string | null };

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
    case 'SET_ERROR':
      return {
        ...state,
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
      console.log('🔐 Attempting login with:', { email: credentials.email });
      const response = await authService.login(credentials);
      
      console.log('✅ Login successful:', {
        user: response.user,
        hasToken: !!response.token
      });
      
      localStorage.setItem(AUTH_CONFIG.JWT_STORAGE_KEY, response.token);
      dispatch({ type: 'SET_USER', payload: { user: response.user, token: response.token } });
    } catch (error) {
      console.error('❌ Login failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Login failed' });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('📝 Attempting registration with:', { 
        email: data.email, 
        firstName: data.firstName, 
        lastName: data.lastName 
      });
      
      const response = await authService.register(data);
      
      console.log('✅ Registration successful:', {
        user: response.user,
        hasToken: !!response.token
      });
      
      localStorage.setItem(AUTH_CONFIG.JWT_STORAGE_KEY, response.token);
      dispatch({ type: 'SET_USER', payload: { user: response.user, token: response.token } });
    } catch (error) {
      console.error('❌ Registration failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Registration failed' });
      throw error;
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem(AUTH_CONFIG.JWT_STORAGE_KEY);
    if (!token) {
      console.log('🔍 No token found, cannot refresh user');
      return;
    }

    try {
      console.log('🔄 Refreshing user data...');
      const user = await authService.verifyToken();
      console.log('✅ User data refreshed:', user);
      dispatch({ type: 'SET_USER', payload: { user, token } });
    } catch (error) {
      console.error('❌ Failed to refresh user:', error);
      logout();
    }
  };

  const logout = () => {
    console.log('👋 Logging out user');
    localStorage.removeItem(AUTH_CONFIG.JWT_STORAGE_KEY);
    authService.logout().catch((error) => {
      console.warn('⚠️ Logout API call failed (non-critical):', error);
    });
    dispatch({ type: 'CLEAR_USER' });
  };

  // Check for existing token on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(AUTH_CONFIG.JWT_STORAGE_KEY);
      
      if (token) {
        console.log('🔍 Found existing token, verifying...');
        try {
          const user = await authService.verifyToken();
          console.log('✅ Token verified, user authenticated:', {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          });
          dispatch({ type: 'SET_USER', payload: { user, token } });
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          // Token is invalid, remove it
          localStorage.removeItem(AUTH_CONFIG.JWT_STORAGE_KEY);
          dispatch({ type: 'CLEAR_USER' });
        }
      } else {
        console.log('🔍 No token found, user not authenticated');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔄 Auth state changed:', {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      hasUser: !!state.user,
      hasToken: !!state.token,
      userDetails: state.user ? {
        id: state.user.id,
        email: state.user.email,
        firstName: state.user.firstName,
        lastName: state.user.lastName,
        role: state.user.role
      } : null
    });
  }, [state]);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
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