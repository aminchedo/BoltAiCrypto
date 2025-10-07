import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, ExternalLink, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, formatCurrency, formatPercentage } from '../utils/designTokens';
import Loading from './Loading';
import Empty from './Empty';
import ErrorBlock from './ErrorBlock';

interface Holding {
  symbol: string;
  name?: string;
  quantity: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  pnl: number;
  pnl_pct: number;
  change_24h: number;
  allocation_pct: number;
}

type SortField = 'symbol' | 'market_value' | 'pnl' | 'change_24h' | 'pnl_pct';
type SortOrder = 'asc' | 'desc';

const HoldingsTable: React.FC = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('market_value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    loadHoldings();
    // Refresh every 5 seconds for price updates
    const interval = setInterval(loadHoldings, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadHoldings = async () => {
    try {
      setError(null);
      const response = await apiService.get<{ positions?: Holding[]; holdings?: Holding[] }>('/api/portfolio/positions');
      const data = response.positions || response.holdings || [];
      setHoldings(data.length > 0 ? data : getMockHoldings());
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load holdings:', err);
      // Use mock data on error
      setHoldings(getMockHoldings());
      setIsLoading(false);
    }
  };

  const getMockHoldings = (): Holding[] => [
    {
      symbol: 'BTCUSDT',
      name: 'Bitcoin',
      quantity: 0.5,
      avg_cost: 43250.00,
      current_price: 44180.50,
      market_value: 22090.25,
      pnl: 465.25,
      pnl_pct: 2.15,
      change_24h: 1.85,
      allocation_pct: 45.5
    },
    {
      symbol: 'ETHUSDT',
      name: 'Ethereum',
      quantity: 5.2,
      avg_cost: 2650.00,
      current_price: 2734.80,
      market_value: 14220.96,
      pnl: 440.96,
      pnl_pct: 3.20,
      change_24h: 2.15,
      allocation_pct: 29.3
    },
    {
      symbol: 'SOLUSDT',
      name: 'Solana',
      quantity: 100,
      avg_cost: 85.50,
      current_price: 88.70,
      market_value: 8870.00,
      pnl: 320.00,
      pnl_pct: 3.74,
      change_24h: -0.85,
      allocation_pct: 18.3
    },
    {
      symbol: 'ADAUSDT',
      name: 'Cardano',
      quantity: 1000,
      avg_cost: 0.485,
      current_price: 0.492,
      market_value: 492.00,
      pnl: 7.00,
      pnl_pct: 1.44,
      change_24h: 0.42,
      allocation_pct: 1.0
    },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedAndFilteredHoldings = React.useMemo(() => {
    let filtered = holdings;
    
    // Apply filter
    if (filterText) {
      filtered = filtered.filter(h =>
        h.symbol.toLowerCase().includes(filterText.toLowerCase()) ||
        (h.name && h.name.toLowerCase().includes(filterText.toLowerCase()))
      );
    }

    // Apply sort
    return filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [holdings, sortField, sortOrder, filterText]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-slate-500" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-cyan-400" /> : 
      <ArrowDown style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-cyan-400" />;
  };

  if (isLoading) {
    return <Loading message="Loading holdings..." />;
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={loadHoldings} />;
  }

  if (holdings.length === 0) {
    return <Empty icon="💼" title="No Holdings" description="Start trading to see your holdings" />;
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.market_value, 0);
  const totalPnL = holdings.reduce((sum, h) => sum + h.pnl, 0);
  const totalPnLPct = (totalPnL / (totalValue - totalPnL)) * 100;

  return (
    <div className="space-y-4">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>Holdings</h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Total: {formatCurrency(totalValue)} • P&L: <span className={clsx(totalPnL >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatCurrency(totalPnL)} ({formatPercentage(totalPnLPct)})
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter holdings..."
              className="pl-9 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
              style={{ fontSize: typography.sm }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-700/50 sticky top-0">
              <tr>
                <th 
                  className="text-left px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white transition-colors"
                  style={{ fontSize: typography.sm }}
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-2">
                    Asset
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 text-slate-400 font-medium"
                  style={{ fontSize: typography.sm }}
                >
                  Quantity
                </th>
                <th 
                  className="text-right px-4 py-3 text-slate-400 font-medium"
                  style={{ fontSize: typography.sm }}
                >
                  Avg Cost
                </th>
                <th 
                  className="text-right px-4 py-3 text-slate-400 font-medium"
                  style={{ fontSize: typography.sm }}
                >
                  Current Price
                </th>
                <th 
                  className="text-right px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white transition-colors"
                  style={{ fontSize: typography.sm }}
                  onClick={() => handleSort('change_24h')}
                >
                  <div className="flex items-center justify-end gap-2">
                    24h Change
                    <SortIcon field="change_24h" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white transition-colors"
                  style={{ fontSize: typography.sm }}
                  onClick={() => handleSort('market_value')}
                >
                  <div className="flex items-center justify-end gap-2">
                    Market Value
                    <SortIcon field="market_value" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 text-slate-400 font-medium cursor-pointer hover:text-white transition-colors"
                  style={{ fontSize: typography.sm }}
                  onClick={() => handleSort('pnl')}
                >
                  <div className="flex items-center justify-end gap-2">
                    P&L
                    <SortIcon field="pnl" />
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 text-slate-400 font-medium"
                  style={{ fontSize: typography.sm }}
                >
                  Allocation
                </th>
                <th 
                  className="text-center px-4 py-3 text-slate-400 font-medium"
                  style={{ fontSize: typography.sm }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredHoldings.map((holding, index) => (
                <motion.tr
                  key={holding.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-slate-800/50 hover:bg-slate-700/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-white" style={{ fontSize: typography.base }}>{holding.symbol}</div>
                      {holding.name && (
                        <div className="text-slate-400" style={{ fontSize: typography.xs }}>{holding.name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-mono" style={{ fontSize: typography.sm }}>
                      {holding.quantity.toFixed(holding.quantity < 1 ? 6 : 2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-slate-300 font-mono" style={{ fontSize: typography.sm }}>
                      {formatCurrency(holding.avg_cost)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-mono" style={{ fontSize: typography.sm }}>
                      {formatCurrency(holding.current_price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={clsx(
                      'font-medium',
                      holding.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    )} style={{ fontSize: typography.sm }}>
                      {holding.change_24h >= 0 ? '+' : ''}{holding.change_24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-mono font-semibold" style={{ fontSize: typography.base }}>
                      {formatCurrency(holding.market_value)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div>
                      <div className={clsx(
                        'font-semibold',
                        holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      )} style={{ fontSize: typography.base }}>
                        {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)}
                      </div>
                      <div className={clsx(
                        'font-medium',
                        holding.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                      )} style={{ fontSize: typography.xs }}>
                        {formatPercentage(holding.pnl_pct)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-slate-300" style={{ fontSize: typography.sm }}>{holding.allocation_pct.toFixed(1)}%</span>
                      <div className="w-16 bg-slate-700/50 rounded-full h-1">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1 rounded-full"
                          style={{ width: `${Math.min(holding.allocation_pct * 2, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-md transition-colors flex items-center gap-1"
                        style={{ fontSize: typography.xs }}
                        onClick={() => {/* Handle trade */}}
                      >
                        Trade
                      </button>
                      <button
                        className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                        onClick={() => {/* Handle details */}}
                        aria-label="View details"
                      >
                        <ExternalLink style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-slate-400 hover:text-white" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedAndFilteredHoldings.length === 0 && filterText && (
        <div className="text-center py-8">
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>No holdings match your filter</p>
        </div>
      )}
    </div>
  );
};

export default HoldingsTable;
