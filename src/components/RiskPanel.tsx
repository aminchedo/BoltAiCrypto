import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface RiskMetrics {
  current_equity: number;
  daily_loss_pct: number;
  consecutive_losses: number;
  trades_today: number;
  daily_loss_limit_hit: boolean;
  consecutive_loss_limit_hit: boolean;
  daily_trade_limit_hit: boolean;
  can_trade: boolean;
  position_size_multiplier: number;
  max_risk_per_trade: number;
  max_trades_per_day: number;
}

const RiskPanel: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [tempMultiplier, setTempMultiplier] = useState(1.0);
  const [tempMaxRisk, setTempMaxRisk] = useState(2.0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRiskMetrics();
    const interval = setInterval(loadRiskMetrics, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRiskMetrics = async () => {
    try {
      const settings = await apiService.getSettings();
      setRiskMetrics(settings.risk_status);
      setTempMultiplier(settings.risk_status.position_size_multiplier);
      setTempMaxRisk(settings.risk_status.max_risk_per_trade);
    } catch (error) {
      console.error('Failed to load risk metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await apiService.updateRiskSettings({
        position_size_multiplier: tempMultiplier,
        max_risk_per_trade: tempMaxRisk / 100
      });
      await loadRiskMetrics();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('http://localhost:8000/api/reset', { method: 'POST' });
      await loadRiskMetrics();
    } catch (error) {
      console.error('Failed to reset system:', error);
    }
  };

  const getEquityColor = () => {
    if (!riskMetrics) return 'text-gray-300';
    if (riskMetrics.daily_loss_pct < -3) return 'text-red-400';
    if (riskMetrics.daily_loss_pct > 2) return 'text-green-400';
    return 'text-gray-300';
  };

  const getRiskLevelColor = () => {
    if (!riskMetrics) return 'text-gray-400';
    if (riskMetrics.consecutive_losses >= 3) return 'text-red-400';
    if (riskMetrics.daily_loss_limit_hit) return 'text-orange-400';
    return 'text-green-400';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="text-center text-gray-400">Loading risk data...</div>
      </div>
    );
  }

  if (!riskMetrics) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="text-center text-red-400">Failed to load risk data</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview Card */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Risk Management</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Current Equity */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Portfolio Value</span>
            <span className={`text-2xl font-bold font-mono ${getEquityColor()}`}>
              ${riskMetrics.current_equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Daily P&L</span>
            <span className={`font-medium ${riskMetrics.daily_loss_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {riskMetrics.daily_loss_pct >= 0 ? '+' : ''}{riskMetrics.daily_loss_pct.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Risk Settings */}
        {isEditing ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Position Size Multiplier</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="3.0"
                value={tempMultiplier}
                onChange={(e) => setTempMultiplier(parseFloat(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Risk Per Trade (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={tempMaxRisk}
                onChange={(e) => setTempMaxRisk(parseFloat(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <button
              onClick={handleSaveSettings}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium transition-colors"
            >
              Save Settings
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Position Multiplier</span>
              <span className="text-white font-medium">{riskMetrics.position_size_multiplier.toFixed(1)}x</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Max Risk/Trade</span>
              <span className="text-white font-medium">{riskMetrics.max_risk_per_trade.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Consecutive Losses</span>
              <span className={`font-medium ${riskMetrics.consecutive_losses > 2 ? 'text-red-400' : 'text-gray-300'}`}>
                {riskMetrics.consecutive_losses}/5
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Trades Today</span>
              <span className={`font-medium ${riskMetrics.trades_today > 7 ? 'text-orange-400' : 'text-gray-300'}`}>
                {riskMetrics.trades_today}/{riskMetrics.max_trades_per_day}
              </span>
            </div>
          </div>
        )}

        {/* Risk Alerts */}
        {(riskMetrics.daily_loss_limit_hit || riskMetrics.consecutive_loss_limit_hit || riskMetrics.daily_trade_limit_hit) && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <span className="font-medium">⚠️ Risk Limit Alert</span>
            </div>
            <div className="text-sm text-red-300 space-y-1">
              {riskMetrics.daily_loss_limit_hit && <p>• Daily loss limit reached</p>}
              {riskMetrics.consecutive_loss_limit_hit && <p>• Too many consecutive losses</p>}
              {riskMetrics.daily_trade_limit_hit && <p>• Daily trade limit reached</p>}
            </div>
          </div>
        )}

        {/* Trading Status */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Trading Status</span>
            <span className={`font-medium ${riskMetrics.can_trade ? 'text-green-400' : 'text-red-400'}`}>
              {riskMetrics.can_trade ? '✅ Active' : '🚫 Restricted'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleReset}
          className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Reset Daily Stats
        </button>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Performance</h3>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Win Rate</span>
            <span className="text-green-400 font-medium">72.5%</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Profit Factor</span>
            <span className="text-green-400 font-medium">1.85</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Max Drawdown</span>
            <span className="text-red-400 font-medium">-{Math.abs(riskMetrics.daily_loss_pct).toFixed(1)}%</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Sharpe Ratio</span>
            <span className="text-white font-medium">2.1</span>
          </div>
        </div>
      </div>

      {/* Position Calculator */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Position Calculator</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Available Capital</span>
            <span className="text-white font-mono">${(riskMetrics.current_equity * 0.9).toFixed(0)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Risk Amount</span>
            <span className="text-white font-mono">${(riskMetrics.current_equity * riskMetrics.max_risk_per_trade / 100).toFixed(0)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Position Size</span>
            <span className="text-blue-400 font-mono">
              {(riskMetrics.current_equity * riskMetrics.position_size_multiplier * 0.1).toFixed(0)} USDT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;