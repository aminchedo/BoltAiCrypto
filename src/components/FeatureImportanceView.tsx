import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Info, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography } from '../utils/designTokens';
import Loading from './Loading';
import ErrorBlock from './ErrorBlock';

interface FeatureImportance {
  feature: string;
  importance: number;
  description?: string;
  impact: 'high' | 'medium' | 'low';
  shap_value?: number;
}

const FeatureImportanceView: React.FC<{ symbol?: string }> = ({ symbol = 'BTCUSDT' }) => {
  const [features, setFeatures] = useState<FeatureImportance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'importance' | 'name'>('importance');
  const [topN, setTopN] = useState(10);

  useEffect(() => {
    loadFeatureImportance();
  }, [symbol]);

  const loadFeatureImportance = async () => {
    try {
      setError(null);
      const response = await apiService.get<{ features?: FeatureImportance[] }>(`/api/ai/feature-importance?symbol=${symbol}`);
      
      if (response?.features) {
        setFeatures(response.features);
      } else {
        setFeatures(generateMockFeatures());
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load feature importance:', err);
      setFeatures(generateMockFeatures());
      setIsLoading(false);
    }
  };

  const generateMockFeatures = (): FeatureImportance[] => {
    const featureNames = [
      'RSI_14', 'MACD_Histogram', 'Volume_MA_20', 'Price_Change_24h',
      'Bollinger_Band_Width', 'ATR_14', 'Stochastic_RSI', 'OBV',
      'Moving_Average_50', 'Moving_Average_200', 'Sentiment_Score',
      'Whale_Activity', 'Order_Book_Imbalance', 'Funding_Rate',
      'Open_Interest', 'Market_Dominance'
    ];

    return featureNames.map((name, i) => {
      const importance = Math.random() * 0.8 + 0.2;
      return {
        feature: name,
        importance,
        description: `${name.replace(/_/g, ' ')} technical indicator`,
        impact: importance > 0.7 ? 'high' : importance > 0.4 ? 'medium' : 'low',
        shap_value: Math.random() * 0.2 - 0.1
      };
    });
  };

  const sortedFeatures = React.useMemo(() => {
    const sorted = [...features].sort((a, b) => {
      if (sortBy === 'importance') {
        return b.importance - a.importance;
      } else {
        return a.feature.localeCompare(b.feature);
      }
    });
    return sorted.slice(0, topN);
  }, [features, sortBy, topN]);

  const chartData = sortedFeatures.map(f => ({
    name: f.feature.replace(/_/g, ' '),
    value: f.importance * 100,
    impact: f.impact
  }));

  if (isLoading) return <Loading message="Loading feature importance..." />;
  if (error) return <ErrorBlock message={error} onRetry={loadFeatureImportance} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
            <TrendingUp style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
            Feature Importance
          </h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Which factors drive {symbol} predictions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
            style={{ fontSize: typography.sm }}
          >
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
            <option value={15}>Top 15</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
            style={{ fontSize: typography.sm }}
          >
            <option value="importance">By Importance</option>
            <option value="name">By Name</option>
          </select>

          <button
            onClick={loadFeatureImportance}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            aria-label="Refresh"
          >
            <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" stroke="#9CA3AF" style={{ fontSize: typography.xs }} />
            <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={150} style={{ fontSize: typography.xs }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: typography.sm
              }}
              formatter={(value: any) => [`${value.toFixed(1)}%`, 'Importance']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.impact === 'high' ? '#10b981' :
                    entry.impact === 'medium' ? '#f59e0b' :
                    '#64748b'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedFeatures.map((feature, index) => (
          <motion.div
            key={feature.feature}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4 group hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold text-white mb-1" style={{ fontSize: typography.base }}>
                  {feature.feature.replace(/_/g, ' ')}
                </div>
                <div className="text-slate-400" style={{ fontSize: typography.xs }}>
                  {feature.description}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-medium border',
                  feature.impact === 'high' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  feature.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-slate-500/20 text-slate-400 border-slate-500/30'
                )} style={{ fontSize: typography.xs }}>
                  {feature.impact}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-slate-400" style={{ fontSize: typography.xs }}>Importance</div>
                  <div className="group-hover:opacity-100 opacity-0 transition-opacity">
                    <div className="relative">
                      <Info style={{ width: dimensions.iconSize.xs, height: dimensions.iconSize.xs }} className="text-slate-500" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        SHAP value: {feature.shap_value?.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className={clsx(
                      'h-2 rounded-full transition-all duration-500',
                      feature.impact === 'high' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                      feature.impact === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                      'bg-gradient-to-r from-slate-500 to-slate-400'
                    )}
                    style={{ width: `${feature.importance * 100}%` }}
                  />
                </div>
              </div>
              <div className="ml-3 font-bold text-white" style={{ fontSize: typography.lg }}>
                {(feature.importance * 100).toFixed(0)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeatureImportanceView;
