// src/hooks/useDocuments.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Document, UploadProgress } from '../types/document';
import { documentService } from '../services/document';
import { useApi } from './useApi';

interface UseDocumentsOptions {
  autoFetch?: boolean;
  filterBy?: {
    type?: string;
    userId?: string;
  };
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const { autoFetch = true, filterBy } = options;
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());

  // Fetch documents API call
  const {
    data: fetchedDocuments,
    loading: fetchLoading,
    error: fetchError,
    execute: fetchDocuments,
    reset: resetFetch
  } = useApi(documentService.getDocuments, {
    immediate: autoFetch,
    onSuccess: (docs) => {
      setDocuments(docs);
    }
  });

  // Upload document API call
  const {
    loading: uploadLoading,
    error: uploadError,
    execute: executeUpload
  } = useApi(documentService.uploadDocument, {
    onSuccess: (newDoc: Document) => {
      setDocuments(prev => [newDoc, ...prev]);
      // Remove upload progress for this document
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[newDoc.name];
        return updated;
      });
    }
  });

  // Delete document API call
  const {
    loading: deleteLoading,
    error: deleteError,
    execute: executeDelete
  } = useApi(documentService.deleteDocument, {
    onSuccess: (_, documentId: string) => {
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setSelectedDocuments(prev => {
        const updated = new Set(prev);
        updated.delete(documentId);
        return updated;   
      });
    }
  });

  // Filtered documents based on options - moved before dependent useMemo/useCallback
  const filteredDocuments = useMemo(() => {
    if (!filterBy) return documents;
    
    return documents.filter(doc => {
      if (filterBy.type && doc.type !== filterBy.type) return false;
      if (filterBy.userId && doc.userId !== filterBy.userId) return false;
      return true;
    });
  }, [documents, filterBy]);

  // Upload with progress tracking
  const uploadDocument = useCallback(async (file: File) => {
    const fileId = `${file.name}_${Date.now()}`;
    
    // Initialize progress tracking
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: {
        fileId,
        progress: 0,
        status: 'pending',
        percentage: 0,
        loaded: 0,
        total: file.size
      }
    }));

    try {
      const result = await executeUpload(file, (progress: UploadProgress) => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { 
            ...progress, 
            fileId,
            percentage: progress.progress,
            loaded: progress.loaded || 0,
            total: progress.total || file.size
          }
        }));
      });
      
      return result;
    } catch (error) {
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'error'
        }
      }));
      throw error;
    }
  }, [executeUpload]);

  // Upload multiple files
  const uploadMultipleDocuments = useCallback(async (files: File[]) => {
    const uploadPromises = files.map(file => uploadDocument(file));
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');
      
      return {
        successful: successful.length,
        failed: failed.length,
        total: files.length
      };
    } catch (error) {
      throw error;
    }
  }, [uploadDocument]);

  // Delete document with confirmation
  const deleteDocument = useCallback(async (documentId: string, skipConfirm = false) => {
    if (!skipConfirm) {
      const confirmed = window.confirm('Are you sure you want to delete this document?');
      if (!confirmed) return;
    }
    
    await executeDelete(documentId);
  }, [executeDelete]);

  // Delete multiple documents
  const deleteSelectedDocuments = useCallback(async () => {
    if (selectedDocuments.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedDocuments.size} document(s)?`
    );
    if (!confirmed) return;

    const deletePromises = Array.from(selectedDocuments).map(id => 
      executeDelete(id)
    );
    
    try {
      await Promise.allSettled(deletePromises);
      setSelectedDocuments(new Set());
    } catch (error) {
      console.error('Error deleting documents:', error);
    }
  }, [selectedDocuments, executeDelete]);

  // Document selection
  const toggleDocumentSelection = useCallback((documentId: string) => {
    setSelectedDocuments(prev => {
      const updated = new Set(prev);
      if (updated.has(documentId)) {
        updated.delete(documentId);
      } else {
        updated.add(documentId);
      }
      return updated;
    });
  }, []);

  // Fixed: removed dependency on filteredDocuments and added correct dependencies
  const selectAllDocuments = useCallback(() => {
    setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)));
  }, [filteredDocuments]);

  const clearSelection = useCallback(() => {
    setSelectedDocuments(new Set());
  }, []);

  // Grouped documents by type
  const documentsByType = useMemo(() => {
    return filteredDocuments.reduce((acc, doc) => {
      if (!acc[doc.type]) {
        acc[doc.type] = [];
      }
      acc[doc.type].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);
  }, [filteredDocuments]);

  // Statistics
  const stats = useMemo(() => {
    const totalSize = filteredDocuments.reduce((sum, doc) => sum + doc.size, 0);
    const typeCount = Object.keys(documentsByType).length;
    
    return {
      total: filteredDocuments.length,
      totalSize,
      typeCount,
      selected: selectedDocuments.size,
      uploading: Object.values(uploadProgress).filter(p => p.status === 'uploading').length
    };
  }, [filteredDocuments, documentsByType, selectedDocuments, uploadProgress]);

  // Refresh documents
  const refreshDocuments = useCallback(() => {
    resetFetch();
    fetchDocuments();
  }, [resetFetch, fetchDocuments]);

  // Effect to handle initial data
  useEffect(() => {
    if (fetchedDocuments && fetchedDocuments !== documents) {
      setDocuments(fetchedDocuments);
    }
  }, [fetchedDocuments]);

  return {
    // Documents data
    documents: filteredDocuments,
    documentsByType,
    uploadProgress: Object.values(uploadProgress),
    selectedDocuments: Array.from(selectedDocuments),
    stats,
    
    // Loading states
    loading: {
      fetch: fetchLoading,
      upload: uploadLoading,
      delete: deleteLoading,
    },
    
    // Error states
    errors: {
      fetch: fetchError,
      upload: uploadError,
      delete: deleteError,
    },
    
    // Actions
    fetchDocuments,
    uploadDocument,
    uploadMultipleDocuments,
    deleteDocument,
    deleteSelectedDocuments,
    refreshDocuments,
    
    // Selection
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelection,
  };
}