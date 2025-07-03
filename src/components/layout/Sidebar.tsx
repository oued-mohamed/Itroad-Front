// ===== 15. src/components/layout/Sidebar.tsx =====
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Documents', href: '/documents', icon: '📁' },
  { name: 'Profile', href: '/profile', icon: '👤' },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="fixed left-0 top-16 w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <nav className="mt-8">
        <div className="px-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 mb-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

