'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [market, setMarket] = useState<any>(null);
  const [whales, setWhales] = useState<any[]>([]);
  const [flows, setFlows] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError('');
        
        const [pricesRes, whalesRes, flowsRes] = await Promise.all([
          fetch('/api/prices', { cache: 'no-store' }),
          fetch('/api/dune/whale-transfers', { cache: 'no-store' }),
          fetch('/api/dune/exchange-flows', { cache: 'no-store' })
        ]);
        
        const pricesData = await pricesRes.json();
        const whalesData = await whalesRes.json();
        const flowsData = await flowsRes.json();
        
        console.log('Prices:', pricesData);
        console.log('Whales:', whalesData);
        console.log('Flows:', flowsData);
        
        // Market data
        const ethPrice = pricesData.data?.[0] || {};
        setMarket({
          eth_price: ethPrice.price || 0,
          eth_volume_24h: ethPrice.volume24h || 0,
          market_cap: ethPrice.market_cap || 0,
          price_change_24h: ethPrice.change24h || 0
        });
        
        // Whale data - check both possible structures
        const whalesList = whalesData.data?.transactions || whalesData.data || whalesData.transactions || [];
        setWhales(whalesList.slice(0, 10));
        
        // Flow data
        const flowsList = flowsData.data || [];
        const totalInflow = flowsList.reduce((sum: number, f: any) => sum + (Number(f.inflow) || 0), 0);
        const totalOutflow = flowsList.reduce((sum: number, f: any) => sum + (Number(f.outflow) || 0), 0);
        const netFlow = totalOutflow - totalInflow;
        
        setFlows({
          total_inflow: totalInflow,
          total_outflow: totalOutflow,
          net_flow: netFlow,
          sentiment: netFlow > 0 ? 'bullish' : netFlow < 0 ? 'bearish' : 'neutral'
        });
        
      } catch (err: any) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const formatNumber = (num: number) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const formatCurrency = (num: number) => {
    if (!num) return '$0';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${formatNumber(num)}`;
  };

  const truncateAddress = (addr: string) => {
    if (!addr) return 'N/A';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading blockchain data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-bold text-lg mb-2">Error Loading Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Blockchain Risk & Transparency Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Real-time whale activity and market analysis</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Market Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 font-medium">ETH Price</p>
              <p className="text-3xl font-bold text-blue-900">${formatNumber(market?.eth_price || 0)}</p>
              {market?.price_change_24h !== undefined && (
                <p className={`text-sm font-semibold mt-2 ${market.price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {market.price_change_24h >= 0 ? '↑' : '↓'} {Math.abs(market.price_change_24h).toFixed(2)}%
                </p>
              )}
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-700 font-medium">24h Volume</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(market?.eth_volume_24h || 0)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-700 font-medium">Market Cap</p>
              <p className="text-3xl font-bold text-purple-900">{formatCurrency(market?.market_cap || 0)}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
              <p className="text-sm text-gray-700 font-medium">Whale Transfers</p>
              <p className="text-3xl font-bold text-orange-900">{whales.length}</p>
            </div>
          </div>
        </div>

        {/* Exchange Flows */}
        {flows && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Exchange Flows</h2>
            <div className="mb-4">
              <span className={`px-6 py-3 rounded-full text-white font-bold text-lg ${
                flows.sentiment === 'bullish' ? 'bg-green-500' :
                flows.sentiment === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
              }`}>
                {flows.sentiment.toUpperCase()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <p className="text-sm font-semibold">Total Inflow</p>
                <p className="text-3xl font-bold text-red-700">{formatNumber(flows.total_inflow)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <p className="text-sm font-semibold">Total Outflow</p>
                <p className="text-3xl font-bold text-green-700">{formatNumber(flows.total_outflow)}</p>
              </div>
              <div className={`rounded-xl p-6 border-2 ${flows.net_flow > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm font-semibold">Net Flow</p>
                <p className={`text-3xl font-bold ${flows.net_flow > 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {flows.net_flow > 0 ? '+' : ''}{formatNumber(flows.net_flow)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Whale Transfers */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Whale Transfers</h2>
          {whales.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No recent whale transfers</p>
          ) : (
            <div className="space-y-4">
              {whales.map((tx: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold">
                        {tx.token || 'ETH'}
                      </span>
                      <div className="mt-2 text-sm font-mono">
                        <span className="text-gray-600">From:</span> {truncateAddress(tx.from_address || tx.from)}
                        {' → '}
                        <span className="text-gray-600">To:</span> {truncateAddress(tx.to_address || tx.to)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{formatNumber(tx.amount || 0)}</p>
                      <p className="text-sm text-gray-600">{tx.token || 'ETH'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
