// ===== Example 3: Search Component using useDebounce =====
// src/components/common/SearchBox.tsx
import React, { useState, useEffect } from 'react';
import { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';
import { useApi } from '../../hooks/useApi';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Input } from './Input';

interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'user';
  url: string;
}

interface SearchBoxProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

// Mock search function - replace with actual API call
const searchApi = async (query: string): Promise<SearchResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Mock results
  return [
    { id: '1', title: `Document containing "${query}"`, type: 'document', url: '/doc/1' },
    { id: '2', title: `User with "${query}"`, type: 'user', url: '/user/2' },
  ];
};

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSelect,
  placeholder = "Search..."
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  
  // Click outside to close results
  const searchRef = useClickOutside<HTMLDivElement>(() => {
    setShowResults(false);
  });

  // Search API call
  const {
    data: results,
    loading,
    execute: performSearch
  } = useApi(searchApi);

  // Debounced search execution
  const debouncedSearch = useDebouncedCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length >= 2) {
        await performSearch(searchQuery);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    },
    300,
    []
  );

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      debouncedSearch(debouncedQuery);
    }
  }, [debouncedQuery, debouncedSearch]);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.title);
    setShowResults(false);
    onSelect?.(result);
  };

  return (
    <div ref={searchRef} className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        onFocus={() => query.length >= 2 && setShowResults(true)}
      />
      
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          ) : results && results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{result.title}</div>
                <div className="text-sm text-gray-500 capitalize">{result.type}</div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

