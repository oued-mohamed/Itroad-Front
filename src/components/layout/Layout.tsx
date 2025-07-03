// ===== 13. src/components/layout/Layout.tsx =====
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 p-6 ${showSidebar ? 'ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

