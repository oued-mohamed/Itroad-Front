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

