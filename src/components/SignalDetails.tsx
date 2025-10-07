import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, TrendingUp, Activity, Target, Shield, Copy, CheckCircle, BarChart3, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { PredictionData, CorrelationData, MarketDepthData } from '../types';
import ScoreGauge from './ScoreGauge';
import DirectionPill from './DirectionPill';
import ConfidenceGauge from './ConfidenceGauge';
import ComponentBreakdown from './ComponentBreakdown';
import SimpleHeatmap from './SimpleHeatmap';
import MarketDepthBars from './MarketDepthBars';
import Loading from './Loading';
import ErrorBlock from './ErrorBlock';
import { spacing, typography, radius, dimensions, getRelativeTime, formatCurrency } from '../utils/designTokens';

interface SignalDetailsProps {
  symbol: string;
  onBack: () => void;
}

export const SignalDetails: React.FC<SignalDetailsProps> = ({ symbol, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'technical' | 'risk' | 'patterns' | 'market'>('technical');
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [marketDepth, setMarketDepth] = useState<MarketDepthData | null>(null);

  useEffect(() => {
    loadData();
  }, [symbol]);

  // Focus trap and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
      if (e.key === 'Tab') {
        // Keep focus within modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleCopySummary = () => {
    const summary = `${symbol} Signal Analysis\n` +
      `Score: ${(score * 100).toFixed(0)}%\n` +
      `Direction: ${direction}\n` +
      `Confidence: ${(confidence * 100).toFixed(0)}%\n` +
      `R/R Ratio: ${calculateRR()}\n` +
      `Generated: ${new Date().toLocaleString()}`;
    
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const calculateRR = () => {
    if (!prediction?.combined_score) return 'N/A';
    const entry = prediction.combined_score.entry_price || 100;
    const sl = prediction.combined_score.stop_loss || entry * 0.98;
    const tp = prediction.combined_score.take_profit || entry * 1.04;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    return risk > 0 ? (reward / risk).toFixed(2) : 'N/A';
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [predictionRes, correlationRes, depthRes] = await Promise.allSettled([
        api.get<PredictionData>(`/api/analytics/predictions/${symbol}`),
        api.get<CorrelationData>('/api/analytics/correlations'),
        api.get<MarketDepthData>(`/api/analytics/market-depth/${symbol}`)
      ]);

      // Handle prediction
      if (predictionRes.status === 'fulfilled') {
        setPrediction(predictionRes.value);
      } else {
        console.warn('Failed to load prediction:', predictionRes.reason);
      }

      // Handle correlation
      if (correlationRes.status === 'fulfilled') {
        setCorrelation(correlationRes.value);
      } else {
        console.warn('Failed to load correlation:', correlationRes.reason);
      }

      // Handle market depth
      if (depthRes.status === 'fulfilled') {
        setMarketDepth(depthRes.value);
      } else {
        console.warn('Failed to load market depth:', depthRes.reason);
      }

      // Only error if ALL requests failed
      if (
        predictionRes.status === 'rejected' &&
        correlationRes.status === 'rejected' &&
        depthRes.status === 'rejected'
      ) {
        throw new Error('خطا در بارگذاری اطلاعات');
      }

    } catch (err: any) {
      console.error('Signal details error:', err);
      setError(err.message || 'خطا در بارگذاری جزئیات سیگنال');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت</span>
          </button>
          <h2 className="text-2xl font-bold text-white">{symbol}</h2>
        </div>
        <Loading message="در حال بارگذاری جزئیات سیگنال..." />
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت</span>
          </button>
          <h2 className="text-2xl font-bold text-white">{symbol}</h2>
        </div>
        <ErrorBlock message={error} onRetry={loadData} />
      </div>
    );
  }

  const score = prediction?.combined_score?.final_score ?? 0;
  const direction = prediction?.combined_score?.direction ?? 'NEUTRAL';
  const confidence = prediction?.confidence ?? prediction?.combined_score?.confidence ?? 0;
  const components = prediction?.component_scores ?? prediction?.combined_score?.components ?? [];

  const tabs = [
    { id: 'technical', label: 'Technical', icon: Activity },
    { id: 'risk', label: 'Risk/Reward', icon: Shield },
    { id: 'patterns', label: 'Patterns', icon: BarChart3 },
    { id: 'market', label: 'Market', icon: TrendingUp },
  ] as const;

  return (
    <div ref={modalRef} className="space-y-6" role="dialog" aria-modal="true" aria-labelledby="signal-details-title">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            style={{ padding: `${spacing.md} ${spacing.lg}`, borderRadius: radius.lg, fontSize: typography.base }}
            className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white transition-colors"
            aria-label="Go back (Esc key)"
          >
            <ArrowRight style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
            <span>Back</span>
          </button>
          <div>
            <h2 id="signal-details-title" style={{ fontSize: typography['2xl'] }} className="font-bold text-white mb-1">{symbol}</h2>
            <div className="flex items-center gap-2">
              <p style={{ fontSize: typography.sm }} className="text-slate-400">Complete Signal Analysis</p>
              <span className="text-slate-600">•</span>
              <span style={{ fontSize: typography.xs }} className="text-slate-500 flex items-center gap-1">
                <Clock style={{ width: dimensions.iconSize.xs, height: dimensions.iconSize.xs }} />
                {getRelativeTime(new Date())}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DirectionPill direction={direction} size="md" />
          <motion.button
            onClick={handleCopySummary}
            style={{ padding: `${spacing.md} ${spacing.lg}`, borderRadius: radius.lg, fontSize: typography.sm }}
            className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white border border-slate-600/50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Copy summary"
          >
            {copied ? <CheckCircle style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-green-400" /> : <Copy style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </motion.button>
          <motion.button
            onClick={() => console.log('Execute trade for', symbol)}
            style={{ padding: `${spacing.md} ${spacing.xl}`, borderRadius: radius.lg, fontSize: typography.base }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Zap style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} />
            <span>Execute</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ padding: `${spacing.md} ${spacing.lg}`, fontSize: typography.base }}
              className={`flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
            >
              <Icon style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Gauge */}
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-4">امتیاز نهایی</h3>
          <div className="flex items-center justify-center py-4">
            <ScoreGauge score={score} size="lg" showLabel={false} />
          </div>
          {prediction?.combined_score?.advice && (
            <p className="text-center text-sm text-slate-300 mt-4">
              {prediction.combined_score.advice}
            </p>
          )}
        </div>

        {/* Confidence */}
        <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-4">اطمینان سیگنال</h3>
          <ConfidenceGauge confidence={confidence} size="md" />
          <div className="grid grid-cols-2 gap-4 mt-4">
            {prediction?.combined_score?.bull_mass !== undefined && (
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">توده صعودی</div>
                <div className="text-lg font-bold text-emerald-400">
                  {(prediction.combined_score.bull_mass * 100).toFixed(0)}%
                </div>
              </div>
            )}
            {prediction?.combined_score?.bear_mass !== undefined && (
              <div className="text-center">
                <div className="text-xs text-slate-400 mb-1">توده نزولی</div>
                <div className="text-lg font-bold text-red-400">
                  {(prediction.combined_score.bear_mass * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'technical' && (
          <motion.div
            key="technical"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            id="technical-panel"
          >
            <div style={{ padding: spacing.xl, borderRadius: radius['2xl'] }} className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: typography.lg }} className="font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 animate-pulse"></div>
                  Component Analysis
                </h3>
                <span style={{ fontSize: typography.sm }} className="text-slate-400">{components.length} detectors</span>
              </div>
              <ComponentBreakdown components={components} />
            </div>
          </motion.div>
        )}

        {activeTab === 'risk' && (
          <motion.div
            key="risk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            id="risk-panel"
          >
            <div style={{ padding: spacing.xl, borderRadius: radius['2xl'] }} className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
              <h3 style={{ fontSize: typography.lg }} className="font-bold text-white mb-6 flex items-center gap-2">
                <Shield style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-cyan-400" />
                Risk/Reward Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div style={{ padding: spacing.lg, borderRadius: radius.xl }} className="bg-slate-800/40 border border-slate-700/50">
                  <div style={{ fontSize: typography.xs }} className="text-slate-400 mb-2">R:R Ratio</div>
                  <div style={{ fontSize: typography['3xl'] }} className="font-bold text-emerald-400">{calculateRR()}</div>
                  <div style={{ fontSize: typography.xs }} className="text-slate-500 mt-2">Higher is better</div>
                </div>
                <div style={{ padding: spacing.lg, borderRadius: radius.xl }} className="bg-slate-800/40 border border-slate-700/50">
                  <div style={{ fontSize: typography.xs }} className="text-slate-400 mb-2">Max Drawdown</div>
                  <div style={{ fontSize: typography['3xl'] }} className="font-bold text-red-400">-{((1 - confidence) * 10).toFixed(1)}%</div>
                  <div style={{ fontSize: typography.xs }} className="text-slate-500 mt-2">Estimated risk</div>
                </div>
                <div style={{ padding: spacing.lg, borderRadius: radius.xl }} className="bg-slate-800/40 border border-slate-700/50">
                  <div style={{ fontSize: typography.xs }} className="text-slate-400 mb-2">Win Probability</div>
                  <div style={{ fontSize: typography['3xl'] }} className="font-bold text-cyan-400">{(confidence * 100).toFixed(0)}%</div>
                  <div style={{ fontSize: typography.xs }} className="text-slate-500 mt-2">Based on confidence</div>
                </div>
              </div>
              <div style={{ marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.xl }} className="bg-blue-500/10 border border-blue-500/30">
                <div style={{ fontSize: typography.sm }} className="text-blue-300 font-semibold mb-2">💡 Risk Management Tips</div>
                <ul style={{ fontSize: typography.sm }} className="text-slate-300 space-y-1">
                  <li>• Risk no more than 1-2% of capital per trade</li>
                  <li>• Always use stop-loss orders</li>
                  <li>• Consider partial exits at key levels</li>
                  <li>• Monitor trade closely in first hour</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'patterns' && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            id="patterns-panel"
          >
            <div style={{ padding: spacing.xl, borderRadius: radius['2xl'] }} className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
              <h3 style={{ fontSize: typography.lg }} className="font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-cyan-400" />
                Pattern Detection
              </h3>
              <div className="space-y-4">
                {components.filter(c => c.name.toLowerCase().includes('pattern')).length > 0 ? (
                  components
                    .filter(c => c.name.toLowerCase().includes('pattern'))
                    .map((component, idx) => (
                      <div key={idx} style={{ padding: spacing.lg, borderRadius: radius.xl }} className="bg-slate-800/40 border border-slate-700/50">
                        <div className="flex justify-between items-center mb-3">
                          <span style={{ fontSize: typography.base }} className="font-semibold text-slate-200">{component.name}</span>
                          <span style={{ fontSize: typography.lg }} className="font-bold text-cyan-400">{(component.score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${component.score * 100}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                          />
                        </div>
                      </div>
                    ))
                ) : (
                  <div style={{ padding: spacing['2xl'] }} className="text-center text-slate-400">
                    <BarChart3 style={{ width: dimensions.iconSize.xl, height: dimensions.iconSize.xl }} className="mx-auto mb-3 text-slate-600" />
                    <p style={{ fontSize: typography.sm }}>No pattern data available for this signal</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'market' && (
          <motion.div
            key="market"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            id="market-panel"
          >
            <div className="space-y-6">
              {marketDepth && (
                <div style={{ padding: spacing.xl, borderRadius: radius['2xl'] }} className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
                  <h3 style={{ fontSize: typography.lg }} className="font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-cyan-400" />
                    Market Depth
                  </h3>
                  <MarketDepthBars data={marketDepth} />
                </div>
              )}
              {correlation && (
                <div style={{ padding: spacing.xl, borderRadius: radius['2xl'] }} className="bg-gray-800/30 backdrop-blur-lg border border-gray-700/50">
                  <h3 style={{ fontSize: typography.lg }} className="font-bold text-white mb-4">Correlation Matrix</h3>
                  <SimpleHeatmap data={correlation} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SignalDetails;
