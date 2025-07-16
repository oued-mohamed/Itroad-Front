import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Calendar,
  MapPin,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Building,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  properties: {
    total: number;
    active: number;
    sold: number;
    pending: number;
    totalValue: number;
    avgPrice: number;
  };
  clients: {
    total: number;
    new: number;
    active: number;
  };
  transactions: {
    total: number;
    thisMonth: number;
    revenue: number;
  };
  documents: {
    total: number;
    recent: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'property' | 'client' | 'transaction' | 'document';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'pending' | 'warning';
}

interface QuickStat {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

export const Dashboard: React.FC = () => {
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('userProfile');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      return userData.firstName || 'Utilisateur';
    }
    return 'Utilisateur';
  });

  const [stats] = useState<DashboardStats>({
    properties: {
      total: 24,
      active: 18,
      sold: 4,
      pending: 2,
      totalValue: 125000000, // 125M DH
      avgPrice: 5208333 // ~5.2M DH
    },
    clients: {
      total: 156,
      new: 12,
      active: 89
    },
    transactions: {
      total: 47,
      thisMonth: 8,
      revenue: 24000000 // 24M DH
    },
    documents: {
      total: 342,
      recent: 15
    }
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'property',
      title: 'Nouvelle Propriété Listée',
      description: 'Villa Moderne Californie - 3 500 000 DH',
      time: 'Il y a 2 heures',
      status: 'success'
    },
    {
      id: '2',
      type: 'client',
      title: 'Nouvelle Demande Client',
      description: 'Fatima El Mansouri intéressée par Rabat centre',
      time: 'Il y a 4 heures',
      status: 'pending'
    },
    {
      id: '3',
      type: 'transaction',
      title: 'Vente Finalisée',
      description: 'Appartement Standing - 2 200 000 DH',
      time: 'Il y a 1 jour',
      status: 'success'
    },
    {
      id: '4',
      type: 'document',
      title: 'Contrat Téléchargé',
      description: 'Promesse de vente Avenue Mohammed V',
      time: 'Il y a 1 jour'
    },
    {
      id: '5',
      type: 'property',
      title: 'Propriété Mise à Jour',
      description: 'Prix réduit pour villa Anfa',
      time: 'Il y a 2 jours',
      status: 'warning'
    }
  ]);

  // Format currency in Moroccan Dirham
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M DH`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K DH`;
    }
    return `${amount.toLocaleString('fr-MA')} DH`;
  };

  const quickStats: QuickStat[] = [
    {
      title: 'Total Propriétés',
      value: stats.properties.total.toString(),
      change: '+12%',
      changeType: 'increase',
      icon: <Building className="w-5 h-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Clients Actifs',
      value: stats.clients.active.toString(),
      change: '+8%',
      changeType: 'increase',
      icon: <Users className="w-5 h-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Documents',
      value: stats.documents.total.toString(),
      change: '+23%',
      changeType: 'increase',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-purple-600'
    },
    {
      title: 'Chiffre d\'Affaires',
      value: formatCurrency(stats.transactions.revenue),
      change: '+15%',
      changeType: 'increase',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-orange-600'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'property': return <Home className="w-4 h-4 text-blue-500" />;
      case 'client': return <Users className="w-4 h-4 text-green-500" />;
      case 'transaction': return <DollarSign className="w-4 h-4 text-orange-500" />;
      case 'document': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const styles = {
      success: 'bg-green-100 text-green-700 text-xs px-2 py-1 rounded',
      pending: 'bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded',
      warning: 'bg-red-100 text-red-700 text-xs px-2 py-1 rounded'
    };

    const labels = {
      success: 'Succès',
      pending: 'En Attente',
      warning: 'Attention'
    };

    return (
      <span className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord</h1>
          <p className="text-gray-600">Bienvenue sur votre plateforme immobilière</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${stat.color}`}>
                  {stat.icon}
                </div>
                <span className="text-sm text-green-600 font-medium">{stat.change} du mois dernier</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Aperçu des Ventes</h2>
              
              {/* Simple Chart Placeholder */}
              <div className="h-64 flex items-end justify-center space-x-2">
                {[25, 35, 30, 45, 40, 55, 50, 65, 60, 75, 70, 85].map((height, index) => (
                  <div
                    key={index}
                    className="bg-green-500 rounded-t"
                    style={{ height: `${height}%`, width: '20px' }}
                  />
                ))}
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>Jan</span>
                <span>Fév</span>
                <span>Mar</span>
                <span>Avr</span>
                <span>Mai</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Activité Récente</h2>
            <p className="text-sm text-gray-600 mb-4">Dernières mises à jour de vos propriétés et clients</p>
            
            <div className="space-y-4">
              {recentActivity.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    {activity.status && (
                      <div className="mt-2">
                        {getStatusBadge(activity.status)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property Overview Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Aperçu des Propriétés</h2>
            <Link 
              to="/properties" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Voir Tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.properties.active}</p>
              <p className="text-sm text-gray-600">Annonces Actives</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.properties.pending}</p>
              <p className="text-sm text-gray-600">Ventes en Cours</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.properties.sold}</p>
              <p className="text-sm text-gray-600">Vendues ce Mois</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.properties.totalValue)}</p>
              <p className="text-sm text-gray-600">Valeur Totale</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Actions Rapides</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/properties" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-500 p-2 rounded-lg mr-3">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Ajouter Propriété</p>
                  <p className="text-xs text-gray-600">Nouvelle annonce</p>
                </div>
              </Link>
              
              <Link 
                to="/clients" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-purple-500 p-2 rounded-lg mr-3">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Ajouter Client</p>
                  <p className="text-xs text-gray-600">Nouveau dossier</p>
                </div>
              </Link>
              
              <Link 
                to="/transactions" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-green-500 p-2 rounded-lg mr-3">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Nouvelle Transaction</p>
                  <p className="text-xs text-gray-600">Enregistrer vente</p>
                </div>
              </Link>
              
              <Link 
                to="/documents" 
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-orange-500 p-2 rounded-lg mr-3">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">Télécharger Document</p>
                  <p className="text-xs text-gray-600">Ajouter fichiers</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Performance Analytics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Analyses de Performance</h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Objectif de Ventes</span>
                  <span className="text-sm font-medium text-gray-900">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Satisfaction Client</span>
                  <span className="text-sm font-medium text-gray-900">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Part de Marché</span>
                  <span className="text-sm font-medium text-gray-900">34%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '34%' }}></div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Top Performer</p>
                    <p className="text-xs text-gray-600">Vous êtes dans le top 10% ce trimestre!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};