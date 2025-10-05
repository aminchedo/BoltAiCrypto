import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import PositionSizer from './PositionSizer';

interface RiskMetrics {
  var95: number;
  leverage: number;
  concentration: number;
  sharpeRatio: number;
  maxDrawdown: number;
  dailyLoss: number;
}

const RiskPanel: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    var95: 0,
    leverage: 0,
    concentration: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    dailyLoss: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRiskStatus();
    const interval = setInterval(loadRiskStatus, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const loadRiskStatus = async () => {
    try {
      const data = await api.get<any>('/api/risk/status');
      setRiskMetrics({
        var95: data.var_95 || 0,
        leverage: data.leverage || 0,
        concentration: data.concentration || 0,
        sharpeRatio: data.sharpe_ratio || 0,
        maxDrawdown: data.max_drawdown || 0,
        dailyLoss: data.daily_loss || 0
      });
      setError(null);
    } catch (err) {
      console.error('Failed to load risk status:', err);
      // Keep existing data, just log error
      setError('Unable to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  const isHealthy = riskMetrics.dailyLoss < 3 && riskMetrics.leverage < 3;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-400 text-sm">
          ⚠️ {error} - Showing cached data
        </div>
      )}
      {/* Risk Status Card */}
      <div className={`bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border ${
        isHealthy ? 'border-emerald-500/30' : 'border-amber-500/30'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isHealthy ? 'bg-emerald-500/20' : 'bg-amber-500/20'
            }`}>
              {isHealthy ? (
                <Shield className="w-6 h-6 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">وضعیت ریسک</h3>
              <p className="text-sm text-slate-400">
                {isHealthy ? 'پرتفوی سالم' : 'نیاز به بررسی'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
            isHealthy 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {isHealthy ? 'سالم' : 'هشدار'}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">VaR (95%)</div>
            <div className="text-xl font-bold text-red-400">
              ${riskMetrics.var95.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">لوریج</div>
            <div className="text-xl font-bold text-cyan-400">
              {riskMetrics.leverage.toFixed(2)}x
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">تمرکز</div>
            <div className="text-xl font-bold text-amber-400">
              {riskMetrics.concentration}%
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">نسبت شارپ</div>
            <div className="text-xl font-bold text-emerald-400">
              {riskMetrics.sharpeRatio}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">حداکثر افت</div>
            <div className="text-xl font-bold text-purple-400">
              {riskMetrics.maxDrawdown}%
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">ضرر روزانه</div>
            <div className={`text-xl font-bold ${
              riskMetrics.dailyLoss > 3 ? 'text-red-400' : 'text-slate-400'
            }`}>
              {riskMetrics.dailyLoss}%
            </div>
          </div>
        </div>
      </div>

      {/* Position Sizer */}
      <PositionSizer />

      {/* Info Card */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-sm font-semibold text-white mb-3">💡 معیارهای ریسک</h4>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>VaR:</strong> حداکثر زیان احتمالی با ۹۵٪ اطمینان</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>لوریج:</strong> نسبت ارزش کل پوزیشن‌ها به سرمایه</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>تمرکز:</strong> درصد سرمایه در بزرگترین پوزیشن</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            <span><strong>نسبت شارپ:</strong> بازده تعدیل‌شده با ریسک</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default RiskPanel;
