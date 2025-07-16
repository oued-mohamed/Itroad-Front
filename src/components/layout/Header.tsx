// src/components/layout/Header.tsx - Header with Sidebar Toggle
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { User, Bell, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { APP_CONFIG } from '../../utils/constants';

interface HeaderProps {
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  showToggle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  isSidebarOpen = false, 
  toggleSidebar, 
  showToggle = true 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleProfileClick = () => {
    navigate('/profile');
    setShowProfileDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
  };

  // Get user's full name and initials
  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || user?.lastName || 'Med';
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || 'User';
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 h-16 w-full sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left side - Menu Toggle + Logo/Brand */}
          <div className="flex items-center space-x-4">
            {/* Menu Toggle Button - Only show if showToggle is true */}
            {showToggle && (
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {isSidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            )}

            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-sm"></div>
              </div>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Adherant Platform
            </h1>
          </div>

          {/* Center - Empty space for balance */}
          <div className="flex-1"></div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-full transition-all duration-300 group">
              <Bell className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-gray-50 dark:focus:bg-gray-800/70 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-gray-700 group-hover:shadow-lg transition-all duration-300">
                    <span className="text-white font-medium text-sm tracking-wide">
                      {getInitials()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getDisplayName()}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-all duration-300 ${showProfileDropdown ? 'rotate-180 text-gray-600 dark:text-gray-300' : 'group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              </button>

              {/* Dropdown Menu */}
              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/60 dark:border-gray-600/60 py-2 z-50 animate-in slide-in-from-top-2 duration-300">
                  <div className="px-4 py-4 border-b border-gray-200/50 dark:border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-semibold text-base tracking-wide">
                          {getInitials()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {getFullName()}
                        </p>
                       
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-200">
                        <User className="w-4 h-4" />
                      </div>
                      <span>View Profile</span>
                    </button>
                  </div>

                  <div className="py-2 border-t border-gray-200/50 dark:border-gray-600/50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-200">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </header>
  );
};