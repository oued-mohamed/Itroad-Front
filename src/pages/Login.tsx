// ===== 17. src/pages/Login.tsx =====
import React, { useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/forms/LoginForm';
import { APP_CONFIG } from '../utils/constants';

export const Login: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to {APP_CONFIG.NAME}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <LoginForm />
          <div className="mt-4 text-center">
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

