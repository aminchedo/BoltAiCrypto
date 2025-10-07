import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingDown, Info, Sliders, Save, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

interface RiskSettings {
  max_position_size: number;
  max_daily_loss: number;
  max_drawdown: number;
  stop_loss_pct: number;
  take_profit_pct: number;
  risk_per_trade: number;
  max_leverage: number;
  risk_reward_ratio: number;
}

interface RiskMetrics {
  current_drawdown: number;
  daily_loss: number;
  portfolio_risk: number;
  value_at_risk: number;
  sharpe_ratio: number;
  max_drawdown_period: number;
}

const RiskPanel: React.FC = () => {
  const [settings, setSettings] = useState<RiskSettings>({
    max_position_size: 10000,
    max_daily_loss: 500,
    max_drawdown: 20,
    stop_loss_pct: 2,
    take_profit_pct: 6,
    risk_per_trade: 1,
    max_leverage: 10,
    risk_reward_ratio: 3
  });

  const [metrics, setMetrics] = useState<RiskMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRiskSettings();
    loadRiskMetrics();
  }, []);

  const loadRiskSettings = async () => {
    try {
      const response = await api.get('/api/risk/settings');
      if (response) {
        setSettings(response as RiskSettings);
      }
    } catch (err) {
      console.error('Failed to load risk settings:', err);
    }
  };

  const loadRiskMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/risk/metrics');
      setMetrics(response as RiskMetrics);
      setError(null);
    } catch (err) {
      console.error('Failed to load risk metrics:', err);
      setError('Failed to load risk metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await api.post('/api/risk/settings', settings);
      setSuccessMessage('Risk settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRiskLevelColor = (risk: number) => {
    if (risk < 30) return { bg: 'bg-green-500/10', border: 'border-green-500/50', text: 'text-green-400', label: 'Low' };
    if (risk < 70) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', label: 'Medium' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400', label: 'High' };
  };

  const riskLevel = metrics ? getRiskLevelColor(metrics.portfolio_risk) : getRiskLevelColor(50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${riskLevel.bg} border ${riskLevel.border} flex items-center justify-center`}>
              <Shield className={`w-6 h-6 ${riskLevel.text}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-50">Risk Management</h2>
              <p className="text-sm text-slate-400">Monitor and control trading risk</p>
            </div>
          </div>

          <motion.button
            onClick={loadRiskMetrics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 rounded-lg text-slate-300 hover:text-slate-50 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Current Risk Metrics */}
      {metrics && (
        <motion.div
          className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-slate-50 mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyan-400" />
            Current Risk Metrics
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Portfolio Risk */}
            <div className={`rounded-xl p-4 border ${riskLevel.border} ${riskLevel.bg}`}>
              <div className="text-xs text-slate-400 mb-2">Portfolio Risk</div>
              <div className={`text-2xl font-bold ${riskLevel.text} mb-1`}>
                {riskLevel.label}
              </div>
              <div className={`text-sm font-medium ${riskLevel.text}`}>
                {metrics.portfolio_risk.toFixed(1)}%
              </div>
            </div>

            {/* Value at Risk */}
            <div className="bg-purple-500/10 border border-purple-500/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-2">Value at Risk</div>
              <div className="text-2xl font-bold text-purple-400">
                ${metrics.value_at_risk.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">95% confidence</div>
            </div>

            {/* Current Drawdown */}
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-2">Current Drawdown</div>
              <div className="text-2xl font-bold text-red-400">
                {metrics.current_drawdown.toFixed(2)}%
              </div>
              <div className="text-sm text-slate-500">
                {metrics.max_drawdown_period}d period
              </div>
            </div>

            {/* Daily Loss */}
            <div className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-2">Daily Loss</div>
              <div className="text-2xl font-bold text-orange-400">
                ${Math.abs(metrics.daily_loss).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Today</div>
            </div>

            {/* Sharpe Ratio */}
            <div className="bg-cyan-500/10 border border-cyan-500/50 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-2">Sharpe Ratio</div>
              <div className="text-2xl font-bold text-cyan-400">
                {metrics.sharpe_ratio.toFixed(2)}
              </div>
              <div className="text-sm text-slate-500">Risk-adjusted</div>
            </div>

            {/* Risk Alert */}
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-xs text-yellow-400 font-medium">
                  {metrics.current_drawdown > settings.max_drawdown ? 'Max Drawdown Exceeded' : 'Within Limits'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Risk Settings */}
      <motion.div
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-slate-50 mb-6 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          Risk Settings
        </h3>

        <div className="space-y-6">
          {/* Max Position Size */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">Max Position Size</label>
              <span className="text-sm font-bold text-cyan-400">${settings.max_position_size.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={settings.max_position_size}
              onChange={(e) => setSettings({ ...settings, max_position_size: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$1,000</span>
              <span>$50,000</span>
            </div>
          </div>

          {/* Max Daily Loss */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">Max Daily Loss</label>
              <span className="text-sm font-bold text-red-400">${settings.max_daily_loss.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={settings.max_daily_loss}
              onChange={(e) => setSettings({ ...settings, max_daily_loss: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>$100</span>
              <span>$2,000</span>
            </div>
          </div>

          {/* Max Drawdown */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">Max Drawdown</label>
              <span className="text-sm font-bold text-orange-400">{settings.max_drawdown}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={settings.max_drawdown}
              onChange={(e) => setSettings({ ...settings, max_drawdown: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>

          {/* Stop Loss % */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">Default Stop Loss</label>
              <span className="text-sm font-bold text-purple-400">{settings.stop_loss_pct}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={settings.stop_loss_pct}
              onChange={(e) => setSettings({ ...settings, stop_loss_pct: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0.5%</span>
              <span>10%</span>
            </div>
          </div>

          {/* Take Profit % */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">Default Take Profit</label>
              <span className="text-sm font-bold text-green-400">{settings.take_profit_pct}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={settings.take_profit_pct}
              onChange={(e) => setSettings({ ...settings, take_profit_pct: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Risk/Reward Ratio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300">Min Risk/Reward Ratio</label>
              <span className="text-sm font-bold text-cyan-400">1:{settings.risk_reward_ratio}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={settings.risk_reward_ratio}
              onChange={(e) => setSettings({ ...settings, risk_reward_ratio: Number(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1:1</span>
              <span>1:5</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          {successMessage && (
            <motion.div
              className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {successMessage}
            </motion.div>
          )}

          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Risk Settings
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default RiskPanel;
