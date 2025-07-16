// ===== Example 4: Theme Toggle using useToggle and useLocalStorage =====
// src/components/common/ThemeToggle.tsx
import React from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useToggle } from '../../hooks/useToggle';
import { Button } from './Button';
import { useClickOutside } from '../../hooks/useClickOutside';
export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isDropdownOpen, toggleDropdown] = useToggle(false);
  
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    toggleDropdown();
  });

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' }
  ] as const;

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toggleDropdown();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="secondary"
        onClick={() => toggleDropdown()}
        className="flex items-center space-x-2"
      >
        <span>{currentTheme.icon}</span>
        <span>{currentTheme.label}</span>
      </Button>
      
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => handleThemeChange(themeOption.value as 'light' | 'dark')}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 ${
                theme === themeOption.value ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              <span>{themeOption.icon}</span>
              <span>{themeOption.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};