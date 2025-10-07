import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Shield, Target, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, formatCurrency, formatPercentage, getRelativeTime } from '../utils/designTokens';
import Loading from './Loading';
import Empty from './Empty';
import ErrorBlock from './ErrorBlock';

interface PortfolioData {
  total_value: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  positions: Position[];
  risk_metrics: RiskMetrics;
  allocation?: Record<string, number>;
  history?: HistoryPoint[];
  last_updated?: string;
}

interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  timestamp: string;
}

interface RiskMetrics {
  portfolio_var: number;
  max_drawdown: number;
  sharpe_ratio: number;
  win_rate: number;
  profit_factor: number;
}

interface HistoryPoint {
  timestamp: string;
  value: number;
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;
type Timeframe = typeof TIMEFRAMES[number];

const PortfolioPanel: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadPortfolioData();
    // Soft refresh every 30 seconds
    const interval = setInterval(loadPortfolioData, 30000);
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadPortfolioData = async () => {
    try {
      setError(null);
      const [summary, allocation, history] = await Promise.all([
        apiService.get<any>('/api/portfolio/summary').catch(() => null),
        apiService.get<any>('/api/portfolio/allocation').catch(() => null),
        apiService.get<any>(`/api/portfolio/history?timeframe=${selectedTimeframe}`).catch(() => null),
      ]);

      if (summary) {
        setPortfolioData({
          total_value: summary.total_value || summary.portfolio_value || 125750.50,
          daily_pnl: summary.daily_pnl || 2847.25,
          daily_pnl_pct: summary.daily_pnl_pct || 2.31,
          positions: summary.positions || [],
          risk_metrics: summary.risk_metrics || {
            portfolio_var: 2.45,
            max_drawdown: -8.32,
            sharpe_ratio: 1.87,
            win_rate: 68.5,
            profit_factor: 1.94
          },
          allocation: allocation?.allocation || {},
          history: history?.history || [],
          last_updated: summary.last_updated || new Date().toISOString()
        });
        setLastUpdate(new Date());
      } else {
        // Mock data for demo
        setPortfolioData({
          total_value: 125750.50,
          daily_pnl: 2847.25,
          daily_pnl_pct: 2.31,
          positions: [
            {
              symbol: 'BTCUSDT',
              side: 'LONG',
              size: 0.5,
              entry_price: 43250.00,
              current_price: 44180.50,
              unrealized_pnl: 465.25,
              unrealized_pnl_pct: 2.15,
              timestamp: new Date().toISOString()
            },
            {
              symbol: 'ETHUSDT',
              side: 'LONG',
              size: 5.2,
              entry_price: 2650.00,
              current_price: 2734.80,
              unrealized_pnl: 440.96,
              unrealized_pnl_pct: 3.20,
              timestamp: new Date().toISOString()
            },
            {
              symbol: 'SOLUSDT',
              side: 'SHORT',
              size: 100,
              entry_price: 85.50,
              current_price: 82.30,
              unrealized_pnl: 320.00,
              unrealized_pnl_pct: 3.74,
              timestamp: new Date().toISOString()
            }
          ],
          risk_metrics: {
            portfolio_var: 2.45,
            max_drawdown: -8.32,
            sharpe_ratio: 1.87,
            win_rate: 68.5,
            profit_factor: 1.94
          },
          allocation: {
            'BTCUSDT': 45.5,
            'ETHUSDT': 32.1,
            'SOLUSDT': 12.8,
            'ADAUSDT': 6.3,
            'Others': 3.3
          },
          history: [],
          last_updated: new Date().toISOString()
        });
        setLastUpdate(new Date());
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      setError(err.message || 'Failed to load portfolio data');
      setIsLoading(false);
    }
  };

  // Prepare allocation pie chart data
  const allocationChartData = useMemo(() => {
    if (!portfolioData?.allocation) return [];
    return Object.entries(portfolioData.allocation).map(([symbol, percentage], index) => ({
      name: symbol,
      value: percentage,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [portfolioData?.allocation]);

  if (isLoading) {
    return <Loading message="Loading portfolio data..." />;
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={loadPortfolioData} />;
  }

  if (!portfolioData) {
    return <Empty icon="💼" title="No Portfolio Data" description="Start trading to see your portfolio" />;
  }

  return (
    <div className="space-y-4">
      {/* Header with Timeframe Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>Portfolio Overview</h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Last updated: {getRelativeTime(lastUpdate)}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-slate-800/30 rounded-lg border border-white/10" style={{ padding: spacing.xs }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={clsx(
                  'rounded-md transition-all duration-200 font-medium',
                  selectedTimeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                )}
                style={{ padding: `${spacing.xs} ${spacing.md}`, fontSize: typography.xs }}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <button
            onClick={loadPortfolioData}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            aria-label="Refresh"
          >
            <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-cyan-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Total Value</span>
          </div>
          <div className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>
            {formatCurrency(portfolioData.total_value)}
          </div>
          <div className={clsx(
            'font-medium mt-1',
            portfolioData.daily_pnl >= 0 ? 'text-green-400' : 'text-red-400'
          )} style={{ fontSize: typography.sm }}>
            {portfolioData.daily_pnl >= 0 ? '+' : ''}{formatCurrency(portfolioData.daily_pnl)} ({formatPercentage(portfolioData.daily_pnl_pct)})
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-blue-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Active Positions</span>
          </div>
          <div className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>
            {portfolioData.positions.length}
          </div>
          <div className="text-slate-400 mt-1" style={{ fontSize: typography.sm }}>
            {portfolioData.positions.filter(p => p.side === 'LONG').length} Long / {portfolioData.positions.filter(p => p.side === 'SHORT').length} Short
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-green-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Win Rate</span>
          </div>
          <div className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>
            {portfolioData.risk_metrics.win_rate.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${portfolioData.risk_metrics.win_rate}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-purple-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Sharpe Ratio</span>
          </div>
          <div className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>
            {portfolioData.risk_metrics.sharpe_ratio.toFixed(2)}
          </div>
          <div className="text-slate-400 mt-1" style={{ fontSize: typography.sm }}>
            Risk-adjusted return
          </div>
        </motion.div>
      </div>

      {/* Allocation & Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Allocation Pie Chart */}
        {allocationChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
          >
            <h3 className="font-semibold text-white mb-4" style={{ fontSize: typography.lg }}>Allocation</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={allocationChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {allocationChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '8px',
                    fontSize: typography.sm
                  }}
                  formatter={(value: any) => `${value.toFixed(1)}%`}
                />
                <Legend 
                  wrapperStyle={{ fontSize: typography.xs }}
                  formatter={(value) => <span className="text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Positions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <h3 className="font-semibold text-white mb-4" style={{ fontSize: typography.lg }}>Active Positions</h3>
          
          {portfolioData.positions.length > 0 ? (
            <div className="space-y-3">
              {portfolioData.positions.map((position, index) => (
                <motion.div
                  key={`${position.symbol}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white" style={{ fontSize: typography.base }}>{position.symbol}</span>
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        position.side === 'LONG'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      )} style={{ fontSize: typography.xs }}>
                        {position.side}
                      </span>
                    </div>
                    <div className={clsx(
                      'text-right font-semibold',
                      position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    )} style={{ fontSize: typography.base }}>
                      {position.unrealized_pnl >= 0 ? '+' : ''}{formatCurrency(position.unrealized_pnl)}
                      <span className="text-xs ml-1">({formatPercentage(position.unrealized_pnl_pct)})</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-slate-400" style={{ fontSize: typography.xs }}>Size</div>
                      <div className="text-white font-mono" style={{ fontSize: typography.sm }}>{position.size}</div>
                    </div>
                    <div>
                      <div className="text-slate-400" style={{ fontSize: typography.xs }}>Entry</div>
                      <div className="text-white font-mono" style={{ fontSize: typography.sm }}>{formatCurrency(position.entry_price)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400" style={{ fontSize: typography.xs }}>Current</div>
                      <div className="text-white font-mono" style={{ fontSize: typography.sm }}>{formatCurrency(position.current_price)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 bg-slate-600/50 rounded-full h-1">
                      <div
                        className={clsx(
                          'h-1 rounded-full transition-all duration-500',
                          position.unrealized_pnl >= 0
                            ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                            : 'bg-gradient-to-r from-red-500 to-red-400'
                        )}
                        style={{ width: `${Math.min(Math.abs(position.unrealized_pnl_pct) * 10, 100)}%` }}
                      />
                    </div>
                    <button
                      className="px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 rounded-md transition-colors flex items-center gap-1"
                      style={{ fontSize: typography.xs }}
                    >
                      Trade
                      <ExternalLink style={{ width: dimensions.iconSize.xs, height: dimensions.iconSize.xs }} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <Empty icon="📊" title="No Positions" description="Open positions to see them here" />
          )}
        </motion.div>
      </div>

      {/* Risk Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
      >
        <h3 className="font-semibold text-white mb-4" style={{ fontSize: typography.lg }}>Risk Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1" style={{ fontSize: typography.xs }}>Portfolio VaR</div>
            <div className="font-semibold text-white" style={{ fontSize: typography.lg }}>
              {portfolioData.risk_metrics.portfolio_var.toFixed(2)}%
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1" style={{ fontSize: typography.xs }}>Max Drawdown</div>
            <div className="font-semibold text-red-400" style={{ fontSize: typography.lg }}>
              {portfolioData.risk_metrics.max_drawdown.toFixed(2)}%
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1" style={{ fontSize: typography.xs }}>Sharpe Ratio</div>
            <div className="font-semibold text-cyan-400" style={{ fontSize: typography.lg }}>
              {portfolioData.risk_metrics.sharpe_ratio.toFixed(2)}
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1" style={{ fontSize: typography.xs }}>Win Rate</div>
            <div className="font-semibold text-green-400" style={{ fontSize: typography.lg }}>
              {portfolioData.risk_metrics.win_rate.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3">
            <div className="text-slate-400 mb-1" style={{ fontSize: typography.xs }}>Profit Factor</div>
            <div className="font-semibold text-white" style={{ fontSize: typography.lg }}>
              {portfolioData.risk_metrics.profit_factor.toFixed(2)}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PortfolioPanel;
