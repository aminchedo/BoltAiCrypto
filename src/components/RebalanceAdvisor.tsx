import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Scale, TrendingUp, AlertCircle, CheckCircle, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, formatCurrency, formatPercentage } from '../utils/designTokens';
import Loading from './Loading';
import Empty from './Empty';
import ErrorBlock from './ErrorBlock';

interface RebalanceData {
  supported: boolean;
  current_allocation: Record<string, number>;
  target_allocation: Record<string, number>;
  suggested_trades: Trade[];
  rationale: string;
  estimated_cost: number;
  last_rebalanced?: string;
}

interface Trade {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  amount_usd: number;
  reason: string;
}

const RebalanceAdvisor: React.FC = () => {
  const [rebalanceData, setRebalanceData] = useState<RebalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    checkCapability();
  }, []);

  const checkCapability = async () => {
    try {
      setError(null);
      const response = await apiService.get<RebalanceData>('/api/portfolio/rebalance');
      
      if (response && response.supported !== false) {
        setRebalanceData(response);
        setIsSupported(true);
      } else {
        setIsSupported(false);
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load rebalance data:', err);
      // If endpoint doesn't exist, assume not supported
      if (err.message?.includes('404')) {
        setIsSupported(false);
        setIsLoading(false);
      } else {
        setError(err.message || 'Failed to load rebalance data');
        setIsLoading(false);
      }
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await apiService.post('/api/portfolio/rebalance/apply');
      setShowConfirmModal(false);
      // Reload data after applying
      await checkCapability();
    } catch (err: any) {
      console.error('Failed to apply rebalance:', err);
      setError(err.message || 'Failed to apply rebalance');
    } finally {
      setIsApplying(false);
    }
  };

  const chartData = React.useMemo(() => {
    if (!rebalanceData) return [];
    
    const symbols = new Set([
      ...Object.keys(rebalanceData.current_allocation),
      ...Object.keys(rebalanceData.target_allocation)
    ]);

    return Array.from(symbols).map(symbol => ({
      symbol,
      current: rebalanceData.current_allocation[symbol] || 0,
      target: rebalanceData.target_allocation[symbol] || 0,
      difference: (rebalanceData.target_allocation[symbol] || 0) - (rebalanceData.current_allocation[symbol] || 0)
    }));
  }, [rebalanceData]);

  if (isLoading) {
    return <Loading message="Checking rebalance capability..." />;
  }

  if (!isSupported) {
    return (
      <div className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-yellow-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white mb-2" style={{ fontSize: typography.lg }}>
              Rebalance Feature Not Available
            </h3>
            <p className="text-slate-400" style={{ fontSize: typography.sm }}>
              The portfolio rebalancing feature is not currently supported by your backend configuration. 
              This feature requires advanced portfolio management capabilities.
            </p>
            <p className="text-slate-400 mt-3" style={{ fontSize: typography.sm }}>
              Contact your system administrator to enable this feature.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={checkCapability} />;
  }

  if (!rebalanceData || rebalanceData.suggested_trades.length === 0) {
    return (
      <Empty 
        icon="⚖️" 
        title="Portfolio Balanced" 
        description="Your portfolio is already well-balanced. No rebalancing needed at this time." 
      />
    );
  }

  const totalRebalanceValue = rebalanceData.suggested_trades.reduce((sum, trade) => sum + Math.abs(trade.amount_usd), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
            <Scale style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
            Portfolio Rebalance Advisor
          </h2>
          <p className="text-slate-400 mt-1" style={{ fontSize: typography.sm }}>
            Optimize your portfolio allocation
            {rebalanceData.last_rebalanced && (
              <span className="ml-2">• Last rebalanced: {new Date(rebalanceData.last_rebalanced).toLocaleDateString()}</span>
            )}
          </p>
        </div>
      </div>

      {/* Rationale Card */}
      {rebalanceData.rationale && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <TrendingUp style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-400 mb-1" style={{ fontSize: typography.base }}>
                Rebalancing Rationale
              </h3>
              <p className="text-slate-300" style={{ fontSize: typography.sm }}>
                {rebalanceData.rationale}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Allocation Comparison Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
      >
        <h3 className="font-semibold text-white mb-4" style={{ fontSize: typography.lg }}>
          Target vs Current Allocation
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="symbol" 
              stroke="#9CA3AF"
              style={{ fontSize: typography.xs }}
            />
            <YAxis 
              stroke="#9CA3AF" 
              tickFormatter={(value) => `${value}%`}
              style={{ fontSize: typography.xs }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: typography.sm
              }}
              formatter={(value: any, name: string) => [
                `${value.toFixed(2)}%`,
                name === 'current' ? 'Current' : 'Target'
              ]}
            />
            <Bar dataKey="current" fill="#64748b" name="Current" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" fill="#06b6d4" name="Target" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Suggested Trades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white" style={{ fontSize: typography.lg }}>
            Suggested Trades
          </h3>
          <div className="text-slate-400" style={{ fontSize: typography.sm }}>
            Total value: {formatCurrency(totalRebalanceValue)}
            {rebalanceData.estimated_cost > 0 && (
              <span className="ml-2">• Est. cost: {formatCurrency(rebalanceData.estimated_cost)}</span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {rebalanceData.suggested_trades.map((trade, index) => (
            <motion.div
              key={`${trade.symbol}-${trade.action}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-slate-700/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white" style={{ fontSize: typography.base }}>
                    {trade.symbol}
                  </span>
                  <span className={clsx(
                    'px-2 py-1 rounded text-xs font-medium',
                    trade.action === 'BUY'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  )} style={{ fontSize: typography.xs }}>
                    {trade.action}
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white" style={{ fontSize: typography.base }}>
                    {formatCurrency(Math.abs(trade.amount_usd))}
                  </div>
                  <div className="text-slate-400" style={{ fontSize: typography.xs }}>
                    {trade.quantity.toFixed(trade.quantity < 1 ? 6 : 2)} units
                  </div>
                </div>
              </div>
              {trade.reason && (
                <p className="text-slate-400 text-sm mt-2" style={{ fontSize: typography.sm }}>
                  {trade.reason}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-end gap-3"
      >
        <button
          onClick={checkCapability}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 hover:text-white transition-colors"
          style={{ fontSize: typography.sm }}
        >
          <RotateCcw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
          Refresh
        </button>
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={rebalanceData.suggested_trades.length === 0}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-600 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ fontSize: typography.sm }}
        >
          <CheckCircle style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
          Apply Rebalance
        </button>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => !isApplying && setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-2" style={{ fontSize: typography.lg }}>
                    Confirm Rebalance
                  </h3>
                  <p className="text-slate-300" style={{ fontSize: typography.sm }}>
                    Are you sure you want to execute {rebalanceData.suggested_trades.length} trades to rebalance your portfolio?
                  </p>
                  <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                    <div className="text-slate-400 mb-1" style={{ fontSize: typography.xs }}>Total Transaction Value</div>
                    <div className="font-bold text-white" style={{ fontSize: typography.lg }}>{formatCurrency(totalRebalanceValue)}</div>
                    {rebalanceData.estimated_cost > 0 && (
                      <div className="text-slate-400 mt-1" style={{ fontSize: typography.xs }}>
                        Est. fees: {formatCurrency(rebalanceData.estimated_cost)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isApplying}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded-lg text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                  style={{ fontSize: typography.sm }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50"
                  style={{ fontSize: typography.sm }}
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <CheckCircle style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
                      Confirm & Execute
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RebalanceAdvisor;
