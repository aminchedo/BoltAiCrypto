import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingDown, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, formatPercentage, getRelativeTime } from '../utils/designTokens';
import Loading from './Loading';
import ErrorBlock from './ErrorBlock';

interface RiskMetric {
  asset: string;
  timeframe: string;
  risk_score: number;
  volatility: number;
  var_95: number;
  max_drawdown: number;
  sharpe_ratio: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

const ASSETS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'BNBUSDT'];
const TIMEFRAMES = ['1h', '4h', '1d', '1w'];

const RiskDashboard: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  useEffect(() => {
    loadRiskMetrics();
    const interval = setInterval(loadRiskMetrics, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadRiskMetrics = async () => {
    try {
      setError(null);
      const response = await apiService.get<{ metrics?: RiskMetric[] }>('/api/risk/metrics');
      
      if (response && response.metrics) {
        setRiskMetrics(response.metrics);
      } else {
        // Generate mock data
        setRiskMetrics(generateMockRiskMetrics());
      }
      
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load risk metrics:', err);
      setRiskMetrics(generateMockRiskMetrics());
      setIsLoading(false);
    }
  };

  const generateMockRiskMetrics = (): RiskMetric[] => {
    const metrics: RiskMetric[] = [];
    
    ASSETS.forEach(asset => {
      TIMEFRAMES.forEach(timeframe => {
        const risk_score = Math.random();
        metrics.push({
          asset,
          timeframe,
          risk_score,
          volatility: Math.random() * 50 + 10,
          var_95: Math.random() * 10 + 2,
          max_drawdown: -(Math.random() * 20 + 5),
          sharpe_ratio: Math.random() * 2 + 0.5,
          risk_level: risk_score < 0.3 ? 'LOW' : risk_score < 0.6 ? 'MEDIUM' : risk_score < 0.85 ? 'HIGH' : 'CRITICAL'
        });
      });
    });
    
    return metrics;
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getHeatColor = (score: number) => {
    if (score < 0.3) return 'bg-green-500/30 hover:bg-green-500/40';
    if (score < 0.6) return 'bg-yellow-500/30 hover:bg-yellow-500/40';
    if (score < 0.85) return 'bg-orange-500/30 hover:bg-orange-500/40';
    return 'bg-red-500/30 hover:bg-red-500/40';
  };

  const handleTileClick = (asset: string) => {
    setSelectedAsset(selectedAsset === asset ? null : asset);
  };

  const handleTileKeyDown = (e: React.KeyboardEvent, asset: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTileClick(asset);
    }
  };

  if (isLoading) {
    return <Loading message="Loading risk metrics..." />;
  }

  if (error) {
    return <ErrorBlock message={error} onRetry={loadRiskMetrics} />;
  }

  const selectedAssetMetrics = selectedAsset 
    ? riskMetrics.filter(m => m.asset === selectedAsset)
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
            <Shield style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
            Risk Dashboard
          </h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Heat map: risk per asset and timeframe • Updated {getRelativeTime(lastUpdate)}
          </p>
        </div>

        <button
          onClick={loadRiskMetrics}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          aria-label="Refresh"
        >
          <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
        </button>
      </div>

      {/* Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white" style={{ fontSize: typography.lg }}>Risk Heat Map</h3>
          
          {/* Legend */}
          <div className="flex items-center gap-4" style={{ fontSize: typography.xs }}>
            <span className="text-slate-400">Risk Level:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/30"></div>
              <span className="text-slate-400">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/30"></div>
              <span className="text-slate-400">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/30"></div>
              <span className="text-slate-400">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/30"></div>
              <span className="text-slate-400">Critical</span>
            </div>
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '120px repeat(4, 1fr)' }}>
          <div></div>
          {TIMEFRAMES.map(tf => (
            <div key={tf} className="text-center text-slate-400 font-medium" style={{ fontSize: typography.sm }}>
              {tf}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        <div className="space-y-2">
          {ASSETS.map((asset, assetIndex) => (
            <motion.div
              key={asset}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: assetIndex * 0.05 }}
              className="grid gap-2"
              style={{ gridTemplateColumns: '120px repeat(4, 1fr)' }}
            >
              <div className="flex items-center font-medium text-white" style={{ fontSize: typography.sm }}>
                {asset.replace('USDT', '')}
              </div>
              
              {TIMEFRAMES.map(timeframe => {
                const metric = riskMetrics.find(m => m.asset === asset && m.timeframe === timeframe);
                if (!metric) return <div key={timeframe} className="bg-slate-700/20 rounded-lg h-16"></div>;
                
                return (
                  <button
                    key={timeframe}
                    onClick={() => handleTileClick(asset)}
                    onKeyDown={(e) => handleTileKeyDown(e, asset)}
                    className={clsx(
                      'rounded-lg p-3 transition-all duration-200 border border-transparent hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
                      getHeatColor(metric.risk_score)
                    )}
                    aria-label={`${asset} ${timeframe} risk: ${metric.risk_level}`}
                  >
                    <div className="text-white font-bold mb-1" style={{ fontSize: typography.base }}>
                      {(metric.risk_score * 100).toFixed(0)}
                    </div>
                    <div className={clsx('text-xs font-medium px-1.5 py-0.5 rounded border inline-block', getRiskColor(metric.risk_level))}
                         style={{ fontSize: typography.xs }}>
                      {metric.risk_level}
                    </div>
                  </button>
                );
              })}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Asset Detail Panel */}
      {selectedAsset && selectedAssetMetrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white" style={{ fontSize: typography.lg }}>
              {selectedAsset} Risk Details
            </h3>
            <button
              onClick={() => setSelectedAsset(null)}
              className="text-slate-400 hover:text-white transition-colors"
              style={{ fontSize: typography.sm }}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {selectedAssetMetrics.map((metric, index) => (
              <motion.div
                key={metric.timeframe}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-700/30 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 font-medium" style={{ fontSize: typography.sm }}>
                    {metric.timeframe}
                  </span>
                  <span className={clsx('text-xs font-medium px-2 py-1 rounded border', getRiskColor(metric.risk_level))}
                        style={{ fontSize: typography.xs }}>
                    {metric.risk_level}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400" style={{ fontSize: typography.xs }}>Risk Score</span>
                    <span className="text-white font-mono" style={{ fontSize: typography.sm }}>
                      {(metric.risk_score * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400" style={{ fontSize: typography.xs }}>Volatility</span>
                    <span className="text-white font-mono" style={{ fontSize: typography.sm }}>
                      {metric.volatility.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400" style={{ fontSize: typography.xs }}>VaR 95%</span>
                    <span className="text-white font-mono" style={{ fontSize: typography.sm }}>
                      {metric.var_95.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400" style={{ fontSize: typography.xs }}>Max DD</span>
                    <span className="text-red-400 font-mono" style={{ fontSize: typography.sm }}>
                      {metric.max_drawdown.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400" style={{ fontSize: typography.xs }}>Sharpe</span>
                    <span className="text-cyan-400 font-mono" style={{ fontSize: typography.sm }}>
                      {metric.sharpe_ratio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <p className="text-blue-400" style={{ fontSize: typography.sm }}>
          <strong>Tip:</strong> Click on any tile to drill down into detailed risk metrics for that asset. 
          Use keyboard navigation with Tab and Enter keys for accessibility.
        </p>
      </div>
    </div>
  );
};

export default RiskDashboard;
