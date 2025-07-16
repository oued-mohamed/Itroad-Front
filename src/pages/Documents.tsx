import React, { useState, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { Upload, FileText, Download, Trash2, Eye, Search, Plus, File, Image, Video, Archive, Folder, Calendar, User, HardDrive } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  category: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  thumbnail?: string;
}

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrat_Propriete_123.pdf',
      type: 'application/pdf',
      size: 2048576,
      category: 'contracts',
      uploadedAt: '2024-01-15T10:30:00Z',
      uploadedBy: 'Ahmed Benali',
      url: '/documents/1',
      thumbnail: '/api/placeholder/150/200'
    },
    {
      id: '2',
      name: 'Piece_Identite_Client.jpg',
      type: 'image/jpeg',
      size: 1024000,
      category: 'identity',
      uploadedAt: '2024-01-14T14:20:00Z',
      uploadedBy: 'Fatima El Mansouri',
      url: '/documents/2',
      thumbnail: '/api/placeholder/150/200'
    },
    {
      id: '3',
      name: 'Rapport_Financier_T1.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 512000,
      category: 'financial',
      uploadedAt: '2024-01-13T09:15:00Z',
      uploadedBy: 'Youssef Ouali',
      url: '/documents/3'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'all', label: 'Tous Documents', icon: FileText },
    { value: 'contracts', label: 'Contrats', icon: FileText },
    { value: 'identity', label: 'Pièces d\'Identité', icon: User },
    { value: 'financial', label: 'Documents Financiers', icon: Calendar },
    { value: 'property-docs', label: 'Documents Propriété', icon: Folder },
    { value: 'legal', label: 'Documents Légaux', icon: FileText },
    { value: 'other', label: 'Autres', icon: File }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Octets';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6 text-gray-600" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6 text-gray-600" />;
    if (type === 'application/pdf') return <FileText className="w-6 h-6 text-gray-600" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="w-6 h-6 text-gray-600" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileText className="w-6 h-6 text-gray-600" />;
    return <File className="w-6 h-6 text-gray-600" />;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const newDoc: Document = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'other',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Utilisateur Actuel',
        url: URL.createObjectURL(file),
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };
      setDocuments(prev => [newDoc, ...prev]);
    });
    setShowUploadModal(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const deleteDocument = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    }
  };

  const totalSize = documents.reduce((sum, doc) => sum + doc.size, 0);

  // Calculate stats
  const stats = {
    total: documents.length,
    totalSize: totalSize,
    byCategory: categories.slice(1).map(cat => ({
      ...cat,
      count: documents.filter(doc => doc.category === cat.value).length
    }))
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
            <p className="text-gray-600">Gérez et organisez vos documents immobiliers en toute sécurité.</p>
          </div>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
          >
            <div className="bg-white bg-opacity-20 rounded-lg p-1">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">Télécharger Documents</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200"></div>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="text-blue-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stockage Total</p>
                <p className="text-2xl font-bold text-green-600">{formatFileSize(stats.totalSize)}</p>
              </div>
              <div className="text-green-600">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Catégories</p>
                <p className="text-2xl font-bold text-purple-600">{categories.length - 1}</p>
              </div>
              <div className="text-purple-600">
                <Folder className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uploads Récents</p>
                <p className="text-2xl font-bold text-orange-600">
                  {documents.filter(doc => {
                    const uploadDate = new Date(doc.uploadedAt);
                    const daysDiff = Math.floor((Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24));
                    return daysDiff <= 7;
                  }).length}
                </p>
              </div>
              <div className="text-orange-600">
                <Upload className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded border p-4 mb-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher documents par nom, catégorie ou uploadeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Grille
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm border-l border-gray-300 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded border p-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Catégories de Documents</h3>
          <div className="grid grid-cols-6 gap-4">
            {stats.byCategory.map(category => {
              const IconComponent = category.icon;
              return (
                <div key={category.value} className="text-center">
                  <div className="text-blue-600 mb-1 flex justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{category.count}</p>
                  <p className="text-xs text-gray-600">{category.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documents Display */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white rounded border p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'Aucun document correspondant' : 'Aucun document téléchargé'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Essayez d\'ajuster votre recherche ou vos filtres'
                : 'Téléchargez votre premier document pour commencer'
              }
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-3"
            >
              <div className="bg-white bg-opacity-20 rounded-lg p-1">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-lg">Télécharger Document</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200"></div>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'Tous Documents' : categories.find(c => c.value === selectedCategory)?.label}
                <span className="ml-2 text-sm text-gray-500">({filteredDocuments.length})</span>
              </h3>
            </div>
            
            <div className="p-4">
              <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-3'}>
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className={`bg-gray-50 rounded border hover:shadow-sm transition-shadow ${viewMode === 'list' ? 'p-3' : 'p-4'}`}>
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-center justify-center h-32 bg-white rounded mb-3 border">
                          {doc.thumbnail ? (
                            <img src={doc.thumbnail} alt={doc.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="text-center">
                              {getFileIcon(doc.type)}
                              <p className="text-xs text-gray-500 mt-2 uppercase">{doc.type.split('/')[1] || 'Fichier'}</p>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 truncate" title={doc.name}>
                          {doc.name}
                        </h3>
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-gray-600">{formatFileSize(doc.size)}</p>
                          <p className="text-xs text-gray-500">Par {doc.uploadedBy}</p>
                          <p className="text-xs text-gray-500">{formatDate(doc.uploadedAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded text-sm flex items-center justify-center gap-1">
                            <Eye className="w-3 h-3" />
                            Voir
                          </button>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 px-3 rounded text-sm">
                            <Download className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => deleteDocument(doc.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded text-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {doc.thumbnail ? (
                            <img src={doc.thumbnail} alt={doc.name} className="w-12 h-12 object-cover rounded" />
                          ) : (
                            <div className="w-12 h-12 bg-white rounded flex items-center justify-center border">
                              {getFileIcon(doc.type)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>Par {doc.uploadedBy}</span>
                            <span>{formatDate(doc.uploadedAt)}</span>
                            <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">{doc.category.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1 rounded">
                            <Eye className="w-3 h-3" />
                          </button>
                          <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1 rounded">
                            <Download className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => deleteDocument(doc.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 p-1 rounded"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Télécharger Documents</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <div
                  className={`border-2 border-dashed rounded p-8 text-center transition-all duration-200 ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Déposez les fichiers ici ou cliquez pour parcourir
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Support pour PDF, images, vidéos, fichiers Excel et autres formats de documents
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.zip,.rar,.xlsx,.xls"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-lg">Choisir Fichiers</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200"></div>
                  </button>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 px-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Télécharger Fichiers
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Documents;