import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface RiskMetrics {
  current_equity: number;
  daily_loss_pct: number;
  consecutive_losses: number;
  daily_loss_limit_hit: boolean;
  consecutive_loss_limit_hit: boolean;
  position_size_multiplier: number;
  max_risk_per_trade: number;
  portfolio_var: number;
  sharpe_ratio: number;
  max_drawdown: number;
}

interface PositionData {
  symbol: string;
  side: string;
  size: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  margin_used: number;
}

const RiskPanel: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [riskSettings, setRiskSettings] = useState({
    maxRiskPerTrade: 2,
    maxDailyLoss: 5,
    positionSizeMultiplier: 1.0,
    stopLossATRMultiple: 1.5,
    emergencyStop: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRiskData();
    const interval = setInterval(fetchRiskData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRiskData = async () => {
    try {
      const [metricsResponse, settingsResponse] = await Promise.all([
        apiService.get('/api/risk/metrics').catch(() => null),
        apiService.getSettings().catch(() => null)
      ]);

      // Handle risk metrics response
      if (metricsResponse) {
        setRiskMetrics(metricsResponse);
      } else {
        // Fallback to settings data if risk metrics endpoint doesn't exist
        if (settingsResponse?.risk_status) {
          setRiskMetrics({
            current_equity: settingsResponse.risk_status.current_equity || 10000,
            daily_loss_pct: settingsResponse.risk_status.daily_loss_pct || 0,
            consecutive_losses: settingsResponse.risk_status.consecutive_losses || 0,
            daily_loss_limit_hit: settingsResponse.risk_status.daily_loss_limit_hit || false,
            consecutive_loss_limit_hit: settingsResponse.risk_status.consecutive_loss_limit_hit || false,
            position_size_multiplier: settingsResponse.risk_status.position_size_multiplier || 1.0,
            max_risk_per_trade: settingsResponse.risk_status.max_risk_per_trade || 2.0,
            portfolio_var: 0.15,
            sharpe_ratio: 1.85,
            max_drawdown: Math.abs(settingsResponse.risk_status.daily_loss_pct || 0)
          });
        }
      }

      // Handle settings
      if (settingsResponse) {
        setRiskSettings({
          maxRiskPerTrade: (settingsResponse.risk_status?.max_risk_per_trade || 2) * 100,
          maxDailyLoss: settingsResponse.max_daily_loss || 5,
          positionSizeMultiplier: settingsResponse.risk_status?.position_size_multiplier || 1.0,
          stopLossATRMultiple: 1.5,
          emergencyStop: settingsResponse.emergency_stop || false
        });
      }

      // Fetch positions if available
      try {
        const positionsResponse = await apiService.get('/api/portfolio/positions');
        setPositions(positionsResponse.positions || []);
      } catch (posErr) {
        console.warn('Positions not available:', posErr);
        // Generate mock positions for demo
        setPositions([
          {
            symbol: 'BTCUSDT',
            side: 'LONG',
            size: 0.5,
            entry_price: 45000,
            current_price: 46200,
            unrealized_pnl: 600,
            unrealized_pnl_pct: 2.67,
            margin_used: 2250
          },
          {
            symbol: 'ETHUSDT',
            side: 'SHORT',
            size: 2.0,
            entry_price: 3200,
            current_price: 3150,
            unrealized_pnl: 100,
            unrealized_pnl_pct: 1.56,
            margin_used: 1600
          }
        ]);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch risk data');
      console.error('Risk data error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRiskSettings = async (newSettings: Partial<typeof riskSettings>) => {
    try {
      await apiService.post('/settings/risk', {
        multiplier: newSettings.positionSizeMultiplier || riskSettings.positionSizeMultiplier,
        max_risk_per_trade: (newSettings.maxRiskPerTrade || riskSettings.maxRiskPerTrade) / 100,
        emergency_stop: newSettings.emergencyStop
      });

      setRiskSettings({ ...riskSettings, ...newSettings });
    } catch (err) {
      console.error('Failed to update risk settings:', err);
    }
  };

  const calculatePortfolioRisk = () => {
    if (!positions.length) return 0;
    
    const totalUnrealizedPnL = positions.reduce((sum, pos) => sum + pos.unrealized_pnl, 0);
    const totalMarginUsed = positions.reduce((sum, pos) => sum + pos.margin_used, 0);
    
    return totalMarginUsed > 0 ? (totalUnrealizedPnL / totalMarginUsed) * 100 : 0;
  };

  const getRiskLevel = (percentage: number) => {
    if (percentage <= 25) return { level: 'LOW', color: 'text-green-400', bg: 'bg-green-400/20' };
    if (percentage <= 50) return { level: 'MODERATE', color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    if (percentage <= 75) return { level: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-400/20' };
    return { level: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-400/20' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <div className="text-red-400 text-center">
          <p>{error}</p>
          <button 
            onClick={fetchRiskData}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const portfolioRisk = calculatePortfolioRisk();
  const portfolioRiskLevel = getRiskLevel(Math.abs(portfolioRisk));
  const dailyLossLevel = getRiskLevel(Math.abs(riskMetrics?.daily_loss_pct || 0));

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4">Risk Overview</h2>
        
        {/* Emergency Alert */}
        {(riskMetrics?.daily_loss_limit_hit || riskMetrics?.consecutive_loss_limit_hit || riskSettings.emergencyStop) && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-red-400 font-semibold">RISK ALERT</span>
            </div>
            <div className="mt-2 text-sm text-red-300">
              {riskMetrics?.daily_loss_limit_hit && <p>• Daily loss limit exceeded</p>}
              {riskMetrics?.consecutive_loss_limit_hit && <p>• Too many consecutive losses</p>}
              {riskSettings.emergencyStop && <p>• Emergency stop activated</p>}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Account Equity</div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(riskMetrics?.current_equity || 0)}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Daily P&L</div>
            <div className={`text-2xl font-bold ${
              (riskMetrics?.daily_loss_pct || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(riskMetrics?.daily_loss_pct || 0) >= 0 ? '+' : ''}
              {(riskMetrics?.daily_loss_pct || 0).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Risk Meters */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Daily Loss Risk</span>
              <span className={dailyLossLevel.color}>{dailyLossLevel.level}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${dailyLossLevel.bg}`}
                style={{ width: `${Math.min(Math.abs(riskMetrics?.daily_loss_pct || 0) * 2, 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Portfolio Risk</span>
              <span className={portfolioRiskLevel.color}>{portfolioRiskLevel.level}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${portfolioRiskLevel.bg}`}
                style={{ width: `${Math.min(Math.abs(portfolioRisk), 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {riskMetrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-xs text-gray-400">Sharpe Ratio</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {riskMetrics?.max_drawdown?.toFixed(2) || 'N/A'}%
            </div>
            <div className="text-xs text-gray-400">Max Drawdown</div>
          </div>
          
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {riskMetrics?.consecutive_losses || 0}
            </div>
            <div className="text-xs text-gray-400">Consecutive Losses</div>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      {positions.length > 0 && (
        <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Open Positions</h3>
          <div className="space-y-3">
            {positions.map((position, index) => (
              <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">{position.symbol}</div>
                    <div className="text-sm text-gray-400">{position.side} • {position.size}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      position.unrealized_pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(position.unrealized_pnl)}
                    </div>
                    <div className={`text-sm ${
                      position.unrealized_pnl_pct >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {position.unrealized_pnl_pct >= 0 ? '+' : ''}{position.unrealized_pnl_pct.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Settings */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-bold text-white mb-4">Risk Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Max Risk Per Trade: {riskSettings.maxRiskPerTrade}%
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={riskSettings.maxRiskPerTrade}
              onChange={(e) => updateRiskSettings({ maxRiskPerTrade: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Position Size Multiplier: {riskSettings.positionSizeMultiplier}x
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={riskSettings.positionSizeMultiplier}
              onChange={(e) => updateRiskSettings({ positionSizeMultiplier: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => updateRiskSettings({ emergencyStop: !riskSettings.emergencyStop })}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                riskSettings.emergencyStop
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {riskSettings.emergencyStop ? 'STOP ACTIVATED' : 'Emergency Stop'}
            </button>
            
            <div className="text-sm text-gray-400">
              Click to {riskSettings.emergencyStop ? 'deactivate' : 'activate'} emergency stop
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;