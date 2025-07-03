// ===== 25. src/pages/Profile.tsx =====
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { ProfileForm } from '../components/forms/ProfileForm';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Personal Information
          </h2>
          {user && <ProfileForm user={user} />}
        </div>
      </div>
    </Layout>
  );
};

