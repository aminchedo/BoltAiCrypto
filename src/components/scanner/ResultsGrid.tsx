import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { ScanResult } from '../../types';
import { spacing, typography, radius, dimensions, getRelativeTime } from '../../utils/designTokens';

interface ResultsGridProps {
  data: ScanResult[];
  onCardClick?: (result: ScanResult) => void;
}

export default function ResultsGrid({ data, onCardClick }: ResultsGridProps) {
  const getScore = (result: ScanResult): number => {
    return result.overall_score ?? result.final_score ?? result.score ?? 0;
  };

  const getDirection = (result: ScanResult): string => {
    return result.overall_direction ?? result.direction ?? 'NEUTRAL';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400 border-green-500/50 bg-green-500/10';
    if (score >= 40) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
    return 'text-red-400 border-red-500/50 bg-red-500/10';
  };

  const getDirectionStyle = (direction: string) => {
    if (direction === 'BULLISH' || direction === 'BUY') {
      return {
        bg: 'bg-green-500/10',
        border: 'border-green-500/50',
        text: 'text-green-400',
        icon: TrendingUp
      };
    }
    if (direction === 'BEARISH' || direction === 'SELL') {
      return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/50',
        text: 'text-red-400',
        icon: TrendingDown
      };
    }
    return {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      icon: Activity
    };
  };

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Scan results">
      {data.map((result, index) => {
        const score = getScore(result);
        const direction = getDirection(result);
        const directionStyle = getDirectionStyle(direction);
        const DirectionIcon = directionStyle.icon;

        return (
          <motion.div
            key={`${result.symbol}-${result.timeframe}-${index}`}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl cursor-pointer group"
            style={{ borderRadius: radius.xl, padding: spacing.xl }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => onCardClick?.(result)}
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(-1)}
            tabIndex={0}
            role="listitem"
            aria-label={`${result.symbol} signal, score ${score.toFixed(0)}, direction ${direction}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCardClick?.(result);
              }
            }}
            className={`bg-slate-900/80 backdrop-blur-xl border shadow-xl cursor-pointer group transition-all duration-300 ${
              focusedIndex === index ? 'border-cyan-500/50 ring-2 ring-cyan-500/25' : 'border-slate-700/50 hover:border-cyan-500/50'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between" style={{ marginBottom: spacing.lg }}>
              <div>
                <h3 style={{ fontSize: typography.xl }} className="font-bold text-slate-50 mb-1">{result.symbol}</h3>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: typography.xs }} className="text-slate-400">{result.timeframe || 'Multi-TF'}</span>
                  {result.tf_count && (
                    <span style={{ fontSize: typography.xs }} className="text-slate-500">•</span>
                  )}
                  {result.tf_count && (
                    <span style={{ fontSize: typography.xs }} className="text-cyan-400">{result.tf_count} TF</span>
                  )}
                </div>
              </div>
              
              <div className={`flex items-center justify-center ${directionStyle.bg} border ${directionStyle.border}`} style={{ width: dimensions.iconSize.xl, height: dimensions.iconSize.xl, borderRadius: radius.xl }}>
                <DirectionIcon style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className={directionStyle.text} />
              </div>
            </div>

            {/* Price */}
            {result.price && (
              <div style={{ marginBottom: spacing.lg }}>
                <div style={{ fontSize: typography['2xl'] }} className="font-mono font-bold text-slate-50">
                  ${result.price.toFixed(2)}
                </div>
                {result.change_24h !== undefined && (
                  <div style={{ fontSize: typography.sm }} className={`font-semibold ${
                    result.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.change_24h >= 0 ? '+' : ''}{result.change_24h.toFixed(2)}% (24h)
                  </div>
                )}
              </div>
            )}

            {/* Signal Badge */}
            <div className="flex items-center gap-2" style={{ marginBottom: spacing.lg }}>
              <span style={{ padding: `${spacing.sm} ${spacing.md}`, borderRadius: radius.lg, fontSize: typography.xs }} className={`font-bold ${directionStyle.bg} ${directionStyle.text} border ${directionStyle.border}`}>
                {direction}
              </span>
            </div>

            {/* Score & Confidence */}
            <div className="grid grid-cols-2 gap-3" style={{ marginBottom: spacing.lg }}>
              <div style={{ borderRadius: radius.lg, padding: spacing.md }} className={`border ${getScoreColor(score)}`}>
                <div style={{ fontSize: typography.xs, marginBottom: spacing.xs }} className="text-slate-400">Score</div>
                <div style={{ fontSize: typography['2xl'] }} className="font-bold">{score.toFixed(0)}</div>
              </div>
              <div style={{ borderRadius: radius.lg, padding: spacing.md }} className="bg-cyan-500/10 border border-cyan-500/50">
                <div style={{ fontSize: typography.xs, marginBottom: spacing.xs }} className="text-slate-400">Confidence</div>
                <div style={{ fontSize: typography['2xl'] }} className="font-bold text-cyan-400">
                  {((result.confidence || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Progress Bars for Key Metrics */}
            {result.rsi_macd_score !== undefined && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between" style={{ fontSize: typography.xs }}>
                    <span className="text-slate-400">Core Signal</span>
                    <span className="text-slate-300 font-medium">
                      {(result.rsi_macd_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 overflow-hidden" style={{ borderRadius: radius.full, height: '6px' }}>
                    <motion.div 
                      className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${result.rsi_macd_score * 100}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 + 0.3 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Timestamp */}
            {result.timestamp && (
              <div className="flex items-center gap-1 text-slate-500 border-t border-slate-800" style={{ fontSize: typography.xs, marginTop: spacing.lg, paddingTop: spacing.lg }}>
                <Clock style={{ width: dimensions.iconSize.xs, height: dimensions.iconSize.xs }} />
                <span>{getRelativeTime(result.timestamp)}</span>
              </div>
            )}
          </motion.div>
        );
      })}

      {data.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl text-center"
          style={{ borderRadius: radius.xl, padding: spacing['3xl'] }}
          role="status"
        >
          <Activity style={{ width: dimensions.iconSize.xl, height: dimensions.iconSize.xl }} className="text-slate-600 mx-auto mb-3" />
          <p style={{ fontSize: typography.base }} className="text-slate-400 mb-2">No results to display</p>
          <p style={{ fontSize: typography.sm }} className="text-slate-500">Try adjusting your scan parameters or run a new scan</p>
        </motion.div>
      )}
    </div>
  );
}
