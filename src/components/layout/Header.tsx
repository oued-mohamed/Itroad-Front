// ===== 14. src/components/layout/Header.tsx =====
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { APP_CONFIG } from '../../utils/constants';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {APP_CONFIG.NAME}
            </h1>
          </div>
          
          {isAuthenticated && user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, {user.firstName}
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

