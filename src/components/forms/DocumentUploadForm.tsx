// src/components/forms/DocumentUploadForm.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../common/Button';
import { UploadProgress } from '../../types/document';

interface DocumentUploadFormProps {
  onUpload: (files: File[], options?: UploadOptions) => Promise<void>;
  onClose?: () => void;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  maxFiles?: number;
  className?: string;
}

interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
}

interface FileWithProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export const DocumentUploadForm: React.FC<DocumentUploadFormProps> = ({
  onUpload,
  onClose,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  allowedFileTypes = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif'
  ],
  maxFiles = 5,
  className = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | undefined => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      return `File type ${fileExtension} is not allowed`;
    }

    return undefined;
  };

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles: FileWithProgress[] = [];
    const currentFileCount = selectedFiles.length;

    for (let i = 0; i < files.length && newFiles.length + currentFileCount < maxFiles; i++) {
      const file = files[i];
      const error = validateFile(file);
      
      // Check for duplicates
      const isDuplicate = selectedFiles.some(f => 
        f.file.name === file.name && f.file.size === file.size
      );

      if (isDuplicate) {
        continue;
      }

      newFiles.push({
        file,
        progress: 0,
        status: error ? 'error' : 'pending',
        error
      });
    }

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, [selectedFiles, maxFiles, maxFileSize, allowedFileTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setSelectedFiles([]);
  };

  const handleUpload = async () => {
    const validFiles = selectedFiles.filter(f => f.status !== 'error');
    if (validFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setSelectedFiles(prev => 
        prev.map(f => f.status !== 'error' ? { ...f, status: 'uploading' } : f)
      );

      // Simulate upload progress
      const uploadPromises = validFiles.map(async (fileWithProgress, index) => {
        return new Promise<void>((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              
              // Update file status to completed
              setSelectedFiles(prev => 
                prev.map(f => 
                  f.file === fileWithProgress.file 
                    ? { ...f, progress: 100, status: 'completed' }
                    : f
                )
              );
              resolve();
            } else {
              // Update progress
              setSelectedFiles(prev => 
                prev.map(f => 
                  f.file === fileWithProgress.file 
                    ? { ...f, progress: Math.round(progress) }
                    : f
                )
              );
            }
          }, 100);
        });
      });

      await Promise.all(uploadPromises);
      
      // Call the actual upload function
      await onUpload(validFiles.map(f => f.file));
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Update failed files
      setSelectedFiles(prev => 
        prev.map(f => 
          f.status === 'uploading' 
            ? { ...f, status: 'error', error: 'Upload failed' }
            : f
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: FileWithProgress['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'uploading':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  const completedFiles = selectedFiles.filter(f => f.status === 'completed').length;
  const hasValidFiles = selectedFiles.some(f => f.status !== 'error');
  const allCompleted = selectedFiles.length > 0 && selectedFiles.every(f => f.status === 'completed' || f.status === 'error');

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents</h2>
        <p className="text-sm text-gray-600">
          Upload up to {maxFiles} files. Maximum size: {formatFileSize(maxFileSize)} per file.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: {allowedFileTypes.join(', ')}
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
          isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="space-y-2">
          <p className="text-gray-600">
            Drag and drop your files here, or{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-500 font-medium"
              onClick={() => fileInputRef.current?.click()}
            >
              browse
            </button>
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedFileTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Selected Files ({selectedFiles.length}/{maxFiles})
            </h3>
            <button
              onClick={clearAllFiles}
              className="text-sm text-red-600 hover:text-red-500"
              disabled={isUploading}
            >
              Clear all
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((fileWithProgress, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getStatusIcon(fileWithProgress.status)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileWithProgress.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(fileWithProgress.file.size)}
                  </p>
                  {fileWithProgress.error && (
                    <p className="text-xs text-red-500 mt-1">{fileWithProgress.error}</p>
                  )}
                  {fileWithProgress.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{fileWithProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${fileWithProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {!isUploading && fileWithProgress.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress Summary */}
      {isUploading && selectedFiles.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Uploading files...
            </span>
            <span className="text-sm text-blue-700">
              {completedFiles} of {selectedFiles.filter(f => f.status !== 'error').length} completed
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${selectedFiles.length > 0 ? (completedFiles / selectedFiles.filter(f => f.status !== 'error').length) * 100 : 0}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {allCompleted && completedFiles > 0 && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium text-green-900">
              {completedFiles} file{completedFiles !== 1 ? 's' : ''} uploaded successfully!
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        {onClose && (
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isUploading}
          >
            {allCompleted ? 'Close' : 'Cancel'}
          </Button>
        )}
        
        {!allCompleted && (
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!hasValidFiles || isUploading || selectedFiles.length === 0}
            loading={isUploading}
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.filter(f => f.status !== 'error').length} file${selectedFiles.filter(f => f.status !== 'error').length !== 1 ? 's' : ''}`}
          </Button>
        )}
        
        {allCompleted && selectedFiles.length > 0 && (
          <Button
            variant="primary"
            onClick={() => {
              setSelectedFiles([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          >
            Upload More Files
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadForm;