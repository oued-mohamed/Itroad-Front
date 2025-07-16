import React, { useState, useEffect } from 'react';
import { Property } from '../../types/property';
import { Transaction } from '../../types/transaction';

interface MarketAnalyticsProps {
  properties: Property[];
  transactions: Transaction[];
  className?: string;
}

interface MarketStats {
  averagePrice: number;
  medianPrice: number;
  pricePerSqft: number;
  averageDaysOnMarket: number;
  totalVolume: number;
  soldProperties: number;
  activeListings: number;
  priceGrowth: number;
  inventoryMonths: number;
}

interface MarketTrend {
  month: string;
  averagePrice: number;
  salesVolume: number;
  listingsCount: number;
}

export const MarketAnalytics: React.FC<MarketAnalyticsProps> = ({
  properties,
  transactions,
  className = ''
}) => {
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y'>('6m');
  const [selectedPropertyType, setSelectedPropertyType] = useState<'all' | Property['type']>('all');

  useEffect(() => {
    calculateMarketStats();
    calculateMarketTrends();
  }, [properties, transactions, selectedTimeframe, selectedPropertyType]);

  const calculateMarketStats = () => {
    const filteredProperties = selectedPropertyType === 'all' 
      ? properties 
      : properties.filter(p => p.type === selectedPropertyType);

    const soldProperties = filteredProperties.filter(p => p.status === 'sold');
    const activeProperties = filteredProperties.filter(p => p.status === 'active');
    
    const prices = soldProperties.map(p => p.price);
    const sqftPrices = soldProperties
      .filter(p => p.details.sqft && p.details.sqft > 0)
      .map(p => p.price / p.details.sqft!);

    const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const medianPrice = prices.length > 0 ? getMedian(prices) : 0;
    const pricePerSqft = sqftPrices.length > 0 ? sqftPrices.reduce((a, b) => a + b, 0) / sqftPrices.length : 0;

    // Calculate days on market (simplified - using random data for demo)
    const averageDaysOnMarket = 45; // In real app, calculate from listing to sold date

    const totalVolume = soldProperties.reduce((sum, p) => sum + p.price, 0);
    
    // Price growth (simplified calculation)
    const priceGrowth = 5.2; // In real app, compare with previous period

    // Inventory months (simplified calculation)
    const monthlySales = soldProperties.length / 6; // Assuming 6 months of data
    const inventoryMonths = monthlySales > 0 ? activeProperties.length / monthlySales : 0;

    setMarketStats({
      averagePrice,
      medianPrice,
      pricePerSqft,
      averageDaysOnMarket,
      totalVolume,
      soldProperties: soldProperties.length,
      activeListings: activeProperties.length,
      priceGrowth,
      inventoryMonths
    });
  };

  const calculateMarketTrends = () => {
    // Generate sample market trends (in real app, this would use historical data)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends: MarketTrend[] = months.map((month, index) => ({
      month,
      averagePrice: 450000 + (index * 15000) + (Math.random() * 20000 - 10000),
      salesVolume: 20 + (Math.random() * 10),
      listingsCount: 50 + (Math.random() * 20)
    }));

    setMarketTrends(trends);
  };

  const getMedian = (arr: number[]): number => {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (!marketStats) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Market Analytics</h2>
        <div className="flex space-x-2">
          <select
            value={selectedPropertyType}
            onChange={(e) => setSelectedPropertyType(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="house">Houses</option>
            <option value="apartment">Apartments</option>
            <option value="condo">Condos</option>
            <option value="townhouse">Townhouses</option>
          </select>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Average Price</p>
              <p className="text-2xl font-bold">{formatCurrency(marketStats.averagePrice)}</p>
              <p className="text-blue-100 text-xs mt-1">
                {formatPercentage(marketStats.priceGrowth)} vs last period
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Median Price</p>
              <p className="text-2xl font-bold">{formatCurrency(marketStats.medianPrice)}</p>
              <p className="text-green-100 text-xs mt-1">
                ${Math.round(marketStats.pricePerSqft)}/sqft average
              </p>
            </div>
            <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Days on Market</p>
              <p className="text-2xl font-bold">{marketStats.averageDaysOnMarket}</p>
              <p className="text-purple-100 text-xs mt-1">
                Average time to sell
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Volume</p>
              <p className="text-2xl font-bold">{formatCurrency(marketStats.totalVolume / 1000000)}M</p>
              <p className="text-orange-100 text-xs mt-1">
                {marketStats.soldProperties} properties sold
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Market Trends Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Trends</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-end space-x-2 h-40">
            {marketTrends.map((trend, index) => {
              const maxPrice = Math.max(...marketTrends.map(t => t.averagePrice));
              const height = (trend.averagePrice / maxPrice) * 120;
              
              return (
                <div key={trend.month} className="flex-1 flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">
                    {formatCurrency(trend.averagePrice / 1000)}K
                  </div>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${height}px` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{trend.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Market Health</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Inventory Level</span>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  marketStats.inventoryMonths < 3 ? 'bg-red-500' :
                  marketStats.inventoryMonths < 6 ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="font-medium">
                  {marketStats.inventoryMonths.toFixed(1)} months
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Market Temperature</span>
              <span className="font-medium">
                {marketStats.inventoryMonths < 3 ? 'Hot' :
                 marketStats.inventoryMonths < 6 ? 'Balanced' : 'Cool'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Active Listings</span>
              <span className="font-medium">{marketStats.activeListings}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Price Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Price per Sqft</span>
              <span className="font-medium">${Math.round(marketStats.pricePerSqft)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Price Growth</span>
              <span className={`font-medium ${
                marketStats.priceGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercentage(marketStats.priceGrowth)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Price Range</span>
              <span className="font-medium">
                {formatCurrency(marketStats.medianPrice * 0.8)} - {formatCurrency(marketStats.medianPrice * 1.2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Property Type Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['house', 'apartment', 'condo', 'townhouse'].map((type) => {
            const typeProperties = properties.filter(p => p.type === type);
            const percentage = properties.length > 0 ? (typeProperties.length / properties.length) * 100 : 0;
            
            return (
              <div key={type} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{typeProperties.length}</div>
                <div className="text-sm text-gray-600 capitalize">{type}s</div>
                <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Recommendations */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">For Sellers</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {marketStats.inventoryMonths < 3 ? (
                <>
                  <li>• Great time to list - low inventory favors sellers</li>
                  <li>• Consider pricing competitively for quick sale</li>
                  <li>• Expect multiple offers and quick sales</li>
                </>
              ) : marketStats.inventoryMonths < 6 ? (
                <>
                  <li>• Balanced market conditions</li>
                  <li>• Price realistically based on comparables</li>
                  <li>• Prepare for moderate negotiation</li>
                </>
              ) : (
                <>
                  <li>• Buyer's market - need competitive pricing</li>
                  <li>• Focus on home staging and marketing</li>
                  <li>• Be prepared for longer time on market</li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">For Buyers</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {marketStats.inventoryMonths < 3 ? (
                <>
                  <li>• Act quickly on properties you like</li>
                  <li>• Get pre-approved for financing</li>
                  <li>• Consider offering above asking price</li>
                </>
              ) : marketStats.inventoryMonths < 6 ? (
                <>
                  <li>• Good selection of properties available</li>
                  <li>• Room for negotiation on price</li>
                  <li>• Take time to find the right property</li>
                </>
              ) : (
                <>
                  <li>• Excellent selection and negotiating power</li>
                  <li>• Consider asking for seller concessions</li>
                  <li>• Good time to be selective</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Data Freshness Indicator */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Data updated: {new Date().toLocaleDateString()} • Based on {properties.length} properties and {transactions.length} transactions
      </div>
    </div>
  );
};