// ===== 18. src/pages/Dashboard.tsx =====
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { useDocuments } from '../hooks/useDocuments';
import { Loading } from '../components/common/Loading';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { documents, stats, loading } = useDocuments();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening with your documents today.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Total Documents
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {loading.fetch ? <Loading size="sm" /> : stats.total}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Storage Used
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {loading.fetch ? <Loading size="sm" /> : `${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              File Types
            </h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {loading.fetch ? <Loading size="sm" /> : stats.typeCount}
            </p>
          </div>
        </div>

        {/* Recent documents section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Documents
            </h2>
          </div>
          <div className="p-6">
            {loading.fetch ? (
              <div className="text-center py-4">
                <Loading text="Loading documents..." />
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-3">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {doc.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No documents uploaded yet.
                </p>
                <Link 
                  to="/documents" 
                  className="text-blue-600 hover:text-blue-500 mt-2 inline-block"
                >
                  Upload your first document
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};



