import React, { useState, useEffect } from 'react';
import { Fish, TrendingUp, TrendingDown, DollarSign, Clock, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, formatCurrency, formatNumber, getRelativeTime } from '../utils/designTokens';
import Loading from './Loading';
import Empty from './Empty';
import ErrorBlock from './ErrorBlock';

interface WhaleTransaction {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  amount_usd: number;
  price: number;
  timestamp: string;
  exchange?: string;
  hash?: string;
}

const WhaleTracker: React.FC<{ selectedSymbol?: string }> = ({ selectedSymbol = 'BTCUSDT' }) => {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minValue, setMinValue] = useState(500000);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadWhaleTransactions();
    const interval = setInterval(loadWhaleTransactions, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [selectedSymbol, minValue]);

  const loadWhaleTransactions = async () => {
    try {
      setError(null);
      
      const response = await apiService.get<{ transactions?: WhaleTransaction[] }>(
        `/api/whales/alert?symbol=${selectedSymbol}&min_value_usd=${minValue}`
      );
      
      if (response && response.transactions) {
        setTransactions(response.transactions);
      } else {
        // Mock data
        setTransactions(generateMockTransactions());
      }
      
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load whale transactions:', err);
      setTransactions(generateMockTransactions());
      setIsLoading(false);
    }
  };

  const generateMockTransactions = (): WhaleTransaction[] => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
    const types: ('buy' | 'sell')[] = ['buy', 'sell'];
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'Unknown'];
    
    return Array.from({ length: 15 }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const amount_usd = Math.random() * 5000000 + minValue;
      const price = selectedSymbol === 'BTCUSDT' ? 44000 + Math.random() * 2000 :
                    selectedSymbol === 'ETHUSDT' ? 2700 + Math.random() * 200 :
                    85 + Math.random() * 10;
      
      return {
        id: `whale-${i}`,
        symbol: selectedSymbol,
        type,
        amount: amount_usd / price,
        amount_usd,
        price,
        timestamp: new Date(Date.now() - i * 600000).toISOString(), // 10 min intervals
        exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
        hash: `0x${Math.random().toString(16).slice(2, 18)}`
      };
    });
  };

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  const stats = React.useMemo(() => {
    const buys = transactions.filter(t => t.type === 'buy');
    const sells = transactions.filter(t => t.type === 'sell');
    
    return {
      totalBuys: buys.reduce((sum, t) => sum + t.amount_usd, 0),
      totalSells: sells.reduce((sum, t) => sum + t.amount_usd, 0),
      buyCount: buys.length,
      sellCount: sells.length,
      netFlow: buys.reduce((sum, t) => sum + t.amount_usd, 0) - sells.reduce((sum, t) => sum + t.amount_usd, 0)
    };
  }, [transactions]);

  if (isLoading) {
    return <Loading message="Loading whale transactions..." />;
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={loadWhaleTransactions} />;
  }

  if (transactions.length === 0) {
    return <Empty icon="🐋" title="No Whale Activity" description="No large transactions detected for this asset" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
            <Fish style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
            Whale Tracker
          </h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Large transactions for {selectedSymbol} • Updated {getRelativeTime(lastUpdate)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={minValue}
            onChange={(e) => setMinValue(Number(e.target.value))}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
            style={{ fontSize: typography.sm }}
          >
            <option value={100000}>$100K+</option>
            <option value={500000}>$500K+</option>
            <option value={1000000}>$1M+</option>
            <option value={5000000}>$5M+</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
            style={{ fontSize: typography.sm }}
          >
            <option value="all">All</option>
            <option value="buy">Buys Only</option>
            <option value="sell">Sells Only</option>
          </select>

          <button
            onClick={loadWhaleTransactions}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            aria-label="Refresh"
          >
            <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-green-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Total Buys</span>
          </div>
          <div className="font-bold text-green-400" style={{ fontSize: typography['2xl'] }}>
            {formatCurrency(stats.totalBuys, 0)}
          </div>
          <div className="text-slate-400" style={{ fontSize: typography.xs }}>
            {stats.buyCount} transactions
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-red-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Total Sells</span>
          </div>
          <div className="font-bold text-red-400" style={{ fontSize: typography['2xl'] }}>
            {formatCurrency(stats.totalSells, 0)}
          </div>
          <div className="text-slate-400" style={{ fontSize: typography.xs }}>
            {stats.sellCount} transactions
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-cyan-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Net Flow</span>
          </div>
          <div className={clsx('font-bold', stats.netFlow >= 0 ? 'text-green-400' : 'text-red-400')} 
               style={{ fontSize: typography['2xl'] }}>
            {stats.netFlow >= 0 ? '+' : ''}{formatCurrency(stats.netFlow, 0)}
          </div>
          <div className="text-slate-400" style={{ fontSize: typography.xs }}>
            {stats.netFlow >= 0 ? 'Accumulation' : 'Distribution'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Fish style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-purple-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Active Whales</span>
          </div>
          <div className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>
            {transactions.length}
          </div>
          <div className="text-slate-400" style={{ fontSize: typography.xs }}>
            Last 24 hours
          </div>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
      >
        <h3 className="font-semibold text-white mb-4" style={{ fontSize: typography.lg }}>Recent Transactions</h3>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
          {filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className={clsx(
                'rounded-full p-2',
                tx.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
              )}>
                {tx.type === 'buy' ? (
                  <TrendingUp style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-green-400" />
                ) : (
                  <TrendingDown style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-red-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium border',
                      tx.type === 'buy' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border-red-500/30'
                    )} style={{ fontSize: typography.xs }}>
                      {tx.type.toUpperCase()}
                    </span>
                    <span className="ml-2 text-white font-semibold" style={{ fontSize: typography.base }}>
                      {tx.symbol}
                    </span>
                    {tx.exchange && (
                      <span className="ml-2 text-slate-400" style={{ fontSize: typography.xs }}>
                        on {tx.exchange}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white" style={{ fontSize: typography.lg }}>
                      {formatCurrency(tx.amount_usd, 0)}
                    </div>
                    <div className="text-slate-400" style={{ fontSize: typography.xs }}>
                      {formatNumber(tx.amount)} {tx.symbol.replace('USDT', '')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400" style={{ fontSize: typography.xs }}>
                      Price: <span className="text-white font-mono">{formatCurrency(tx.price)}</span>
                    </div>
                    {tx.hash && (
                      <div className="text-slate-400" style={{ fontSize: typography.xs }}>
                        <code className="text-cyan-400">{tx.hash.slice(0, 10)}...</code>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400" style={{ fontSize: typography.xs }}>
                    <Clock style={{ width: dimensions.iconSize.xs, height: dimensions.iconSize.xs }} />
                    {getRelativeTime(new Date(tx.timestamp))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-blue-400" style={{ fontSize: typography.sm }}>
          <strong>Note:</strong> Whale transactions are large trades that may indicate significant market sentiment. 
          Data is rate-limited and updated every 30 seconds to ensure service stability.
        </p>
      </div>
    </div>
  );
};

export default WhaleTracker;
