// ===== Example 2: DocumentList using useDocuments =====
// src/components/documents/DocumentList.tsx
import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useDebounce } from '../../hooks/useDebounce';
import { useToggle } from '../../hooks/useToggle';
import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const DocumentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, toggleUploadForm] = useToggle(false);
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  const { hasPermission } = usePermissions();
  
  const {
    documents,
    uploadProgress,
    selectedDocuments,
    stats,
    loading,
    errors,
    uploadDocument,
    deleteDocument,
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelection,
    refreshDocuments
  } = useDocuments();

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        await uploadDocument(file);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    event.target.value = ''; // Reset input
  };

  const handleDeleteSelected = async () => {
    if (selectedDocuments.length === 0) return;
    
    const confirmed = window.confirm(
      `Delete ${selectedDocuments.length} selected document(s)?`
    );
    
    if (confirmed) {
      for (const docId of selectedDocuments) {
        try {
          await deleteDocument(docId, true); // Skip individual confirmations
        } catch (error) {
          console.error('Delete failed:', error);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-600">
            {stats.total} documents • {(stats.totalSize / 1024 / 1024).toFixed(1)} MB total
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={refreshDocuments} variant="secondary">
            Refresh
          </Button>
          
          {hasPermission('write_documents') && (
            <Button onClick={toggleUploadForm}>
              Upload Documents
            </Button>
          )}
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {selectedDocuments.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={clearSelection}
            >
              Clear ({selectedDocuments.length})
            </Button>
            
            {hasPermission('delete_documents') && (
              <Button
                variant="danger"
                onClick={handleDeleteSelected}
              >
                Delete Selected
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Upload form */}
      {showUploadForm && hasPermission('write_documents') && (
        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="w-full"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
          <p className="text-sm text-gray-500 mt-2">
            Select multiple files to upload
          </p>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Uploading...</h3>
          {uploadProgress.map((progress) => (
            <div key={progress.fileId} className="flex items-center space-x-3">
              <span className="text-sm truncate">{progress.fileId}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    progress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <span className="text-sm">{progress.progress}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Document table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading.fetch ? (
          <div className="p-8 text-center">Loading documents...</div>
        ) : errors.fetch ? (
          <div className="p-8 text-center text-red-600">
            Error: {errors.fetch}
            <Button onClick={refreshDocuments} className="ml-4">
              Retry
            </Button>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No documents match your search' : 'No documents uploaded yet'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === filteredDocuments.length}
                    onChange={() => 
                      selectedDocuments.length === filteredDocuments.length 
                        ? clearSelection() 
                        : selectAllDocuments()
                    }
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.includes(document.id)}
                      onChange={() => toggleDocumentSelection(document.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {document.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {document.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {(document.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary">
                        Download
                      </Button>
                      {hasPermission('delete_documents') && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => deleteDocument(document.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

