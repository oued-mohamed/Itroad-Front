// ===== 27. src/pages/NotFound.tsx =====
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-6xl mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The page you're looking for doesn't exist.
          </p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

