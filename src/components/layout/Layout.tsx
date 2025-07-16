// src/components/layout/Layout.tsx
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize sidebar state based on screen size
  useEffect(() => {
    if (showSidebar) {
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          // On desktop, start with sidebar open
          setIsSidebarOpen(true);
        } else {
          // On mobile, start with sidebar closed
          setIsSidebarOpen(false);
        }
      };

      // Set initial state only once
      if (typeof window !== 'undefined') {
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }
    }
  }, [showSidebar]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when navigation item is clicked
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <Header 
        isSidebarOpen={showSidebar && isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        showToggle={showSidebar}
      />
      
      <div className="flex"> {/* Removed pt-16 to reduce spacing */}
        {/* Sidebar */}
        {showSidebar && <Sidebar isOpen={isSidebarOpen} onClose={handleNavClick} />}
        
        {/* Main Content */}
        <main className={`flex-1 pt-8 px-6 py-1 transition-all duration-300 ease-in-out ${
          showSidebar && isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};