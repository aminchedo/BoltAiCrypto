import React from 'react';
import { motion } from 'framer-motion';
import { ScanResult } from '../../types';
import ScoreGauge from '../ScoreGauge';
import DirectionPill from '../DirectionPill';
import { spacing, typography, radius, dimensions } from '../../utils/designTokens';

interface ResultsChartProps {
  results: ScanResult[];
}

const ResultsChart: React.FC<ResultsChartProps> = ({ results }) => {
  const getScore = (result: ScanResult): number => {
    return result.overall_score ?? result.final_score ?? result.score ?? 0;
  };

  const getDirection = (result: ScanResult): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
    return result.overall_direction ?? result.direction ?? 'NEUTRAL';
  };

  return (
    <div className="space-y-6" role="region" aria-label="Results chart view">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: typography.sm, padding: spacing.lg, borderRadius: radius.lg }}
        className="text-slate-400 text-center bg-slate-900/30 border border-slate-700/30"
      >
        💡 Chart View: Visual representation of scores and trends
      </motion.div>
      
      {/* Bar Chart Visualization */}
      <div className="space-y-4">
        {results.map((result, index) => {
          const score = getScore(result);
          const direction = getDirection(result);
          
          return (
            <motion.div
              key={`${result.symbol}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              style={{ borderRadius: radius.xl, padding: spacing.lg }}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/50 transition-all cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={`${result.symbol} chart entry, score ${(score * 100).toFixed(0)}%`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  console.log('Open details for', result.symbol);
                }
              }}
            >
              <div className="flex items-center gap-4">
                {/* Symbol and Direction */}
                <div className="w-32 flex flex-col gap-2">
                  <div style={{ fontSize: typography.lg }} className="font-bold text-white">
                    {result.symbol}
                  </div>
                  <DirectionPill direction={direction} size="sm" />
                </div>

                {/* Score Gauge */}
                <div className="flex-shrink-0">
                  <ScoreGauge score={score} size="sm" showLabel={false} />
                </div>

                {/* Horizontal Bar */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-slate-400" style={{ fontSize: typography.xs }}>
                    <span>Score: {(score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="relative overflow-hidden bg-slate-900/50 border border-slate-700/30" style={{ height: '32px', borderRadius: radius.lg }}>
                    <div
                      className={`
                        absolute inset-y-0 right-0 transition-all duration-1000 ease-out
                        ${score < 0.3 ? 'bg-gradient-to-l from-red-500 to-red-600' :
                          score < 0.7 ? 'bg-gradient-to-l from-amber-500 to-amber-600' :
                          'bg-gradient-to-l from-emerald-500 to-emerald-600'
                        }
                      `}
                      style={{ 
                        width: `${score * 100}%`,
                        animationDelay: `${index * 100}ms`,
                      }}
                    />
                    {/* Percentage Label Inside Bar */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span style={{ fontSize: typography.sm }} className="text-white font-bold drop-shadow-lg">
                        {(score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="flex gap-2">
                  {result.timeframes?.slice(0, 3).map((tf) => (
                    <span
                      key={tf}
                      style={{ padding: `${spacing.xs} ${spacing.sm}`, borderRadius: radius.sm, fontSize: typography.xs }}
                      className={`font-mono border ${
                        direction === 'BULLISH' 
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                          : direction === 'BEARISH'
                          ? 'bg-red-500/20 border-red-500/30 text-red-300'
                          : 'bg-slate-600/20 border-slate-500/30 text-slate-400'
                      }`}
                    >
                      {tf}
                    </span>
                  ))}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => console.log('Open details for', result.symbol)}
                  style={{ padding: `${spacing.sm} ${spacing.lg}`, borderRadius: radius.lg, fontSize: typography.sm }}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 font-medium transition-all whitespace-nowrap"
                  aria-label={`View details for ${result.symbol}`}
                >
                  Details
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsChart;
