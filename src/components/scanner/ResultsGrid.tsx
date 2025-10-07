import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { ScanResult } from '../../types';

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((result, index) => {
        const score = getScore(result);
        const direction = getDirection(result);
        const directionStyle = getDirectionStyle(direction);
        const DirectionIcon = directionStyle.icon;

        return (
          <motion.div
            key={`${result.symbol}-${result.timeframe}-${index}`}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => onCardClick?.(result)}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-50 mb-1">{result.symbol}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{result.timeframe || 'Multi-TF'}</span>
                  {result.tf_count && (
                    <span className="text-xs text-slate-500">•</span>
                  )}
                  {result.tf_count && (
                    <span className="text-xs text-cyan-400">{result.tf_count} TF</span>
                  )}
                </div>
              </div>
              
              <div className={`w-12 h-12 rounded-xl ${directionStyle.bg} border ${directionStyle.border} flex items-center justify-center`}>
                <DirectionIcon className={`w-6 h-6 ${directionStyle.text}`} />
              </div>
            </div>

            {/* Price */}
            {result.price && (
              <div className="mb-4">
                <div className="text-2xl font-mono font-bold text-slate-50">
                  ${result.price.toFixed(2)}
                </div>
                {result.change_24h !== undefined && (
                  <div className={`text-sm font-semibold ${
                    result.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {result.change_24h >= 0 ? '+' : ''}{result.change_24h.toFixed(2)}% (24h)
                  </div>
                )}
              </div>
            )}

            {/* Signal Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${directionStyle.bg} ${directionStyle.text} border ${directionStyle.border}`}>
                {direction}
              </span>
            </div>

            {/* Score & Confidence */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`rounded-lg p-3 border ${getScoreColor(score)}`}>
                <div className="text-xs text-slate-400 mb-1">Score</div>
                <div className="text-2xl font-bold">{score.toFixed(0)}</div>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-1">Confidence</div>
                <div className="text-2xl font-bold text-cyan-400">
                  {((result.confidence || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Progress Bars for Key Metrics */}
            {result.rsi_macd_score !== undefined && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Core Signal</span>
                    <span className="text-slate-300 font-medium">
                      {(result.rsi_macd_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full transition-all duration-500"
                      style={{ width: `${result.rsi_macd_score * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Timestamp */}
            {result.timestamp && (
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-4 pt-4 border-t border-slate-800">
                <Clock className="w-3 h-3" />
                <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
            )}
          </motion.div>
        );
      })}

      {data.length === 0 && (
        <div className="col-span-full bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-12 text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No results to display</p>
        </div>
      )}
    </div>
  );
}
