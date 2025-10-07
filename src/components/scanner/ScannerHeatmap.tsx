import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanResult } from '../../types';
import { spacing, typography, radius, dimensions } from '../../utils/designTokens';

interface ScannerHeatmapProps {
  results: ScanResult[];
}

const ScannerHeatmap: React.FC<ScannerHeatmapProps> = ({ results }) => {
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  const getScore = (result: ScanResult): number => {
    return result.overall_score ?? result.final_score ?? result.score ?? 0;
  };

  const getDirection = (result: ScanResult): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
    return result.overall_direction ?? result.direction ?? 'NEUTRAL';
  };

  const getColor = (score: number) => {
    if (score < 0.3) return 'bg-red-500';
    if (score < 0.4) return 'bg-red-400';
    if (score < 0.5) return 'bg-orange-400';
    if (score < 0.6) return 'bg-yellow-400';
    if (score < 0.7) return 'bg-lime-400';
    if (score < 0.8) return 'bg-emerald-400';
    return 'bg-emerald-500';
  };

  const getOpacity = (score: number) => {
    // Higher scores get higher opacity
    return Math.max(0.3, Math.min(1, score + 0.2));
  };

  // Calculate grid dimensions based on result count
  const resultCount = results.length;
  const cols = Math.ceil(Math.sqrt(resultCount));

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ padding: spacing['3xl'], borderRadius: radius.xl }}
        className="text-center bg-slate-900/30 border border-slate-700/30"
        role="status"
      >
        <p style={{ fontSize: typography.base }} className="text-slate-400 mb-2">No heatmap data available</p>
        <p style={{ fontSize: typography.sm }} className="text-slate-500">Run a scan to visualize results</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Heatmap visualization">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: spacing.lg, borderRadius: radius.lg }}
        className="text-center bg-slate-900/30 border border-slate-700/30"
      >
        <h3 style={{ fontSize: typography.lg, marginBottom: spacing.sm }} className="font-semibold text-white">🗺️ Market Heatmap</h3>
        <p style={{ fontSize: typography.sm }} className="text-slate-400">
          Size = Score | Color = Direction | Intensity = Signal Strength
        </p>
      </motion.div>

      {/* Heatmap Grid */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/30 border border-slate-700/30 overflow-hidden"
        style={{
          borderRadius: radius.xl,
          padding: spacing.xl,
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: spacing.md,
          minHeight: '400px'
        }}
        role="grid"
        aria-label="Market heatmap grid"
      >
        {results.map((result, index) => {
          const score = getScore(result);
          const direction = getDirection(result);
          const size = Math.max(60, score * 150); // Min 60px, max 150px
          const isHovered = hoveredSymbol === result.symbol;

          return (
            <motion.div
              key={result.symbol}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-center justify-center relative"
              onMouseEnter={() => setHoveredSymbol(result.symbol)}
              onMouseLeave={() => setHoveredSymbol(null)}
              tabIndex={0}
              role="gridcell"
              aria-label={`${result.symbol}, score ${(score * 100).toFixed(0)}%, ${direction}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setHoveredSymbol(result.symbol);
                }
              }}
            >
              <motion.div
                className={`${getColor(score)} flex flex-col items-center justify-center transition-all duration-300 cursor-pointer`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: getOpacity(score),
                  borderRadius: radius.lg,
                }}
                whileHover={{ scale: 1.1 }}
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <span style={{ fontSize: typography.sm }} className="text-white font-bold drop-shadow-lg">
                  {result.symbol.replace('USDT', '')}
                </span>
                <span style={{ fontSize: typography.xs }} className="text-white font-semibold mt-1 drop-shadow-lg">
                  {(score * 100).toFixed(0)}%
                </span>
                {direction === 'BULLISH' && <span style={{ fontSize: typography.lg }} className="text-white">↑</span>}
                {direction === 'BEARISH' && <span style={{ fontSize: typography.lg }} className="text-white">↓</span>}
              </motion.div>

              {/* Tooltip on Hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ padding: spacing.md, borderRadius: radius.lg, fontSize: typography.sm }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-20 w-48 bg-slate-800 border border-slate-700 shadow-2xl"
                    role="tooltip"
                  >
                    <div style={{ fontSize: typography.base }} className="font-bold text-white mb-1">{result.symbol}</div>
                    <div className="text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Score:</span>
                        <span className="font-mono">{(score * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Direction:</span>
                        <span className={
                          direction === 'BULLISH' ? 'text-emerald-400' :
                          direction === 'BEARISH' ? 'text-red-400' : 'text-slate-400'
                        }>
                          {direction}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Timeframes:</span>
                        <span className="font-mono">{result.tf_count || 0}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ padding: spacing.lg, borderRadius: radius.lg }}
        className="flex flex-wrap items-center justify-center gap-6 bg-slate-900/30 border border-slate-700/30"
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: typography.sm }} className="text-slate-400">Direction:</span>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div style={{ width: '12px', height: '12px', borderRadius: radius.sm }} className="bg-emerald-500"></div>
              <span style={{ fontSize: typography.xs }} className="text-slate-300">Bullish</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: '12px', height: '12px', borderRadius: radius.sm }} className="bg-red-500"></div>
              <span style={{ fontSize: typography.xs }} className="text-slate-300">Bearish</span>
            </div>
            <div className="flex items-center gap-1">
              <div style={{ width: '12px', height: '12px', borderRadius: radius.sm }} className="bg-yellow-500"></div>
              <span style={{ fontSize: typography.xs }} className="text-slate-300">Neutral</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: typography.sm }} className="text-slate-400">Strength:</span>
          <div className="flex gap-1 items-center">
            <div style={{ width: '32px', height: '12px', borderRadius: radius.sm }} className="bg-emerald-500 opacity-30"></div>
            <div style={{ width: '32px', height: '12px', borderRadius: radius.sm }} className="bg-emerald-500 opacity-50"></div>
            <div style={{ width: '32px', height: '12px', borderRadius: radius.sm }} className="bg-emerald-500 opacity-70"></div>
            <div style={{ width: '32px', height: '12px', borderRadius: radius.sm }} className="bg-emerald-500 opacity-100"></div>
            <span style={{ fontSize: typography.xs }} className="text-slate-300 ml-2">Weak → Strong</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScannerHeatmap;
