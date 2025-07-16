// src/components/layout/Sidebar.tsx - Collapsible Sidebar
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BarChart3, 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  User,
  LogOut,
  X
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview and statistics'
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: Home,
    description: 'Property listings and management'
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
    description: 'Client management'
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FileText,
    description: 'Document management'
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: DollarSign,
    description: 'Transaction tracking'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Business analytics and reports'
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
    description: 'Account settings and preferences'
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay - Only on mobile screens when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          

         

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600 dark:border-blue-400'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                        }`
                      }
                      title={item.description}
                    >
                      <IconComponent className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
            >
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors duration-200">
                <LogOut className="w-4 h-4" />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};