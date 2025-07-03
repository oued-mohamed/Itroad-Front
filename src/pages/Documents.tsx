// ===== 24. src/pages/Documents.tsx =====
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { DocumentList } from '../components/documents/DocumentList';

export const Documents: React.FC = () => {
  return (
    <Layout>
      <DocumentList />
    </Layout>
  );
};

