// ===== 22. src/pages/Register.tsx =====
import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RegisterForm } from '../components/forms/RegisterForm';
import { APP_CONFIG } from '../utils/constants';

export const Register: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Join {APP_CONFIG.NAME}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create your account
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <RegisterForm />
          <div className="mt-4 text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

