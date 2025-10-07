import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TradingSignal } from '../types';
import { TrendingUp, TrendingDown, Minus, Activity, Target, Shield, Clock, X } from 'lucide-react';
import { spacing, typography, radius, dimensions, getRelativeTime, formatCurrency } from '../utils/designTokens';

interface SignalCardProps {
  signal: TradingSignal;
  onAnalyze: (symbol: string) => void;
  onExecute: (signal: TradingSignal) => void;
  onDismiss?: (signal: TradingSignal) => void;
  index?: number;
}

const SignalCard: React.FC<SignalCardProps> = ({ signal, onAnalyze, onExecute, onDismiss, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    setTimeout(() => {
      onDismiss?.(signal);
    }, 300);
  };
  const getSignalIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp className="w-5 h-5" />;
      case 'SELL': return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getSignalColors = (action: string) => {
    switch (action) {
      case 'BUY': 
        return {
          gradient: 'from-green-500 to-emerald-600',
          bg: 'bg-green-500/10',
          text: 'text-green-400',
          border: 'border-green-500/50',
          glow: 'shadow-green-500/25'
        };
      case 'SELL': 
        return {
          gradient: 'from-red-500 to-rose-600',
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/50',
          glow: 'shadow-red-500/25'
        };
      default: 
        return {
          gradient: 'from-slate-500 to-gray-600',
          bg: 'bg-slate-500/10',
          text: 'text-slate-400',
          border: 'border-slate-500/50',
          glow: 'shadow-slate-500/25'
        };
    }
  };

  const colors = getSignalColors(signal.action);

  // Calculate risk/reward ratio
  const calculateRR = () => {
    const entry = signal.entry_price || signal.price;
    const sl = signal.stop_loss || signal.price * 0.98;
    const tp = signal.take_profit || signal.price * 1.04;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return risk > 0 ? (reward / risk).toFixed(2) : 'N/A';
  };

  if (isDismissed) {
    return null;
  }

  return (
    <motion.div
      className={`relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border ${colors.border} hover:${colors.glow} transition-all duration-300 group hover:scale-[1.02]`}
      style={{ borderRadius: radius['2xl'], padding: spacing.xl }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDismissed ? 0 : 1, scale: isDismissed ? 0.9 : 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`Trading signal for ${signal.symbol}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onAnalyze(signal.symbol);
        if (e.key === 'Delete' && onDismiss) handleDismiss();
      }}
    >
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Dismiss button */}
      {onDismiss && isHovered && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-slate-800/80 hover:bg-red-500/80 border border-slate-600 hover:border-red-500 rounded-lg transition-colors"
          onClick={handleDismiss}
          aria-label="Dismiss signal"
          title="Dismiss (Delete key)"
        >
          <X className="w-4 h-4 text-slate-300" />
        </motion.button>
      )}
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}>
              {getSignalIcon(signal.action)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-50">{signal.symbol}</h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${colors.bg} ${colors.text} border ${colors.border}`}>
                  {signal.action}
                </span>
                <div className={`w-2 h-2 rounded-full ${colors.gradient} bg-gradient-to-r animate-pulse`} />
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div style={{ fontSize: typography['3xl'] }} className="font-bold text-slate-50">
              {(signal.final_score * 100).toFixed(0)}
            </div>
            <div style={{ fontSize: typography.xs }} className="text-slate-400 flex items-center gap-1 justify-end mt-1">
              <Clock style={{ width: dimensions.iconSize.xs, height: dimensions.iconSize.xs }} />
              {getRelativeTime(signal.timestamp)}
            </div>
          </div>
        </div>

        {/* Price Information */}
        <div style={{ marginBottom: spacing.xl, padding: spacing.lg, borderRadius: radius.lg }} className="bg-slate-800/50 border border-slate-700/50">
          <div style={{ fontSize: typography['3xl'], marginBottom: spacing.md }} className="font-mono font-bold text-slate-50">
            {formatCurrency(signal.price, signal.price < 1 ? 6 : 2)}
          </div>
          <div className="grid grid-cols-3 gap-3" style={{ fontSize: typography.sm }}>
            <div className="flex flex-col gap-1">
              <Target style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-cyan-400" />
              <div style={{ fontSize: typography.xs }} className="text-slate-400">Entry</div>
              <div className="text-slate-50 font-semibold">{formatCurrency(signal.entry_price || signal.price, 2)}</div>
            </div>
            <div className="flex flex-col gap-1">
              <Shield style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-red-400" />
              <div style={{ fontSize: typography.xs }} className="text-slate-400">Stop Loss</div>
              <div className="text-slate-50 font-semibold">{formatCurrency(signal.stop_loss || signal.price * 0.98, 2)}</div>
            </div>
            <div className="flex flex-col gap-1">
              <Target style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-emerald-400" />
              <div style={{ fontSize: typography.xs }} className="text-slate-400">R:R Ratio</div>
              <div className="text-emerald-400 font-bold">{calculateRR()}</div>
            </div>
          </div>
        </div>

        {/* Algorithm Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="text-sm font-semibold text-slate-300 mb-3">Component Scores</div>
          
          {/* Core RSI+MACD (40%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Core (RSI+MACD)</span>
              <span className="font-mono text-slate-50 font-medium">
                {(signal.rsi_macd_score * 40).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${signal.rsi_macd_score * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* SMC (25%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">SMC Analysis</span>
              <span className="font-mono text-slate-50 font-medium">
                {(signal.smc_score * 25).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-purple-400 to-violet-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${signal.smc_score * 100}%` }}
                transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Patterns (20%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Pattern Detection</span>
              <span className="font-mono text-slate-50 font-medium">
                {(signal.pattern_score * 20).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${signal.pattern_score * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Sentiment (10%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Market Sentiment</span>
              <span className="font-mono text-slate-50 font-medium">
                {(signal.sentiment_score * 10).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-pink-400 to-rose-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${signal.sentiment_score * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* ML (5%) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ML Prediction</span>
              <span className="font-mono text-slate-50 font-medium">
                {(signal.ml_score * 5).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-indigo-400 to-blue-500 h-full"
                initial={{ width: 0 }}
                animate={{ width: `${signal.ml_score * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Overall Confidence */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-300">Overall Confidence</span>
            <span className="text-lg font-bold text-slate-50">{(signal.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600/50">
            <motion.div 
              className={`h-full bg-gradient-to-r ${colors.gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${signal.confidence * 100}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button 
            onClick={() => onAnalyze(signal.symbol)}
            style={{ padding: `${spacing.md} ${spacing.lg}`, borderRadius: radius.lg, fontSize: typography.base }}
            className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-slate-500 text-slate-50 font-medium transition-all duration-200 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="View detailed analysis"
            title="View Details (Enter key)"
          >
            <Activity style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
            <span>Details</span>
          </motion.button>
          
          <motion.button 
            onClick={() => onExecute(signal)}
            style={{ padding: `${spacing.md} ${spacing.lg}`, borderRadius: radius.lg, fontSize: typography.base }}
            className={`flex-1 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
              signal.action === 'HOLD'
                ? 'bg-slate-600/50 cursor-not-allowed opacity-50'
                : `bg-gradient-to-r ${colors.gradient} hover:shadow-lg ${colors.glow}`
            }`}
            disabled={signal.action === 'HOLD'}
            whileHover={signal.action !== 'HOLD' ? { scale: 1.02 } : {}}
            whileTap={signal.action !== 'HOLD' ? { scale: 0.98 } : {}}
            aria-label={`Execute ${signal.action} trade`}
            title={signal.action === 'HOLD' ? 'Hold Position' : `Execute ${signal.action}`}
          >
            {getSignalIcon(signal.action)}
            <span>{signal.action === 'HOLD' ? 'Hold' : `Trade`}</span>
          </motion.button>
          
          {onDismiss && (
            <motion.button
              onClick={handleDismiss}
              style={{ padding: `${spacing.md} ${spacing.lg}`, borderRadius: radius.lg }}
              className="bg-slate-800/80 hover:bg-red-500/20 border border-slate-600/50 hover:border-red-500/50 text-slate-50 transition-all duration-200 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Dismiss signal"
              title="Dismiss (Delete key)"
            >
              <X style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SignalCard;
