// src/components/documents/DocumentViewer.tsx
import React, { useState, useEffect } from 'react';
import { Document } from '../../types/document';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (document: Document) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  isOpen,
  onClose,
  onDownload
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (document && isOpen) {
      setIsLoading(true);
      setError(null);
      
      // Simulate loading time
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [document, isOpen]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  const renderDocumentContent = () => {
    if (!document) return null;

    const isImage = document.type.startsWith('image/');
    const isPDF = document.type === 'application/pdf';
    const isText = document.type.startsWith('text/');

    if (isImage) {
      return (
        <div className="flex justify-center items-center h-full">
          <img
            src={document.url || '/api/placeholder/600/400'}
            alt={document.name}
            style={{ transform: `scale(${zoom / 100})` }}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="h-full">
          <iframe
            src={document.url ? `${document.url}#zoom=${zoom}` : '/api/placeholder/pdf'}
            className="w-full h-full border-0"
            title={document.name}
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      );
    }

    if (isText) {
      return (
        <div 
          className="p-6 h-full overflow-auto bg-gray-50"
          style={{ fontSize: `${zoom}%` }}
        >
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {/* Sample text content - in real app, fetch from API */}
            This is a sample text document content.
            You can view and read the document here.
            
            Document: {document.name}
            Type: {document.type}
            Size: {document.size} bytes
          </pre>
        </div>
      );
    }

    // Unsupported file type
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium mb-2">Preview not available</h3>
        <p className="text-center mb-4">
          This file type ({document.type}) cannot be previewed in the browser.
        </p>
        {onDownload && (
          <Button onClick={() => onDownload(document)} variant="primary">
            Download to view
          </Button>
        )}
      </div>
    );
  };

  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
      {/* Document Info */}
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate max-w-md">
          {document?.name}
        </h3>
        <span className="text-sm text-gray-500">
          ({document?.type})
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-300">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="border-0 rounded-r-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          
          <button
            onClick={handleZoomReset}
            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 min-w-[60px]"
          >
            {zoom}%
          </button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="border-0 rounded-l-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>

        {/* Download Button */}
        {onDownload && document && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDownload(document)}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </Button>
        )}

        {/* Close Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
    >
      <div className="h-full flex flex-col">
        {renderToolbar()}
        
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loading size="lg" text="Loading document..." />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Error loading document</h3>
              <p className="text-center">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setIsLoading(true);
                  setTimeout(() => setIsLoading(false), 1000);
                }}
                variant="primary"
                className="mt-4"
              >
                Try again
              </Button>
            </div>
          ) : (
            renderDocumentContent()
          )}
        </div>
      </div>
    </Modal>
  );
};

export default DocumentViewer;