import React, { useState } from 'react';
import { Calculator, TrendingUp, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export const PositionSizer: React.FC = () => {
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(50000);
  const [stopLoss, setStopLoss] = useState(48000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [backendResult, setBackendResult] = useState<any>(null);
  
  // Calculate position size (local fallback)
  const riskAmount = accountSize * (riskPercent / 100);
  const priceRisk = Math.abs(entryPrice - stopLoss);
  const positionSize = priceRisk > 0 ? riskAmount / priceRisk : 0;
  const positionValue = positionSize * entryPrice;
  const positionPercent = (positionValue / accountSize) * 100;

  const calculateWithBackend = async () => {
    setIsCalculating(true);
    try {
      const result = await api.post('/api/risk/calculate-position', {
        account_balance: accountSize,
        risk_percentage: riskPercent,
        entry_price: entryPrice,
        stop_loss: stopLoss
      });
      setBackendResult(result);
    } catch (error) {
      console.error('Backend calculation failed:', error);
      setBackendResult(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Use backend result if available, otherwise use local calculation
  const displaySize = backendResult?.position_size || positionSize;
  const displayValue = backendResult?.position_value || positionValue;
  const displayPercent = backendResult?.position_percent || positionPercent;

  return (
    <div className="bg-gray-800/30 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">محاسبه حجم پوزیشن</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              حجم حساب ($)
            </label>
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              ریسک هر معامله (%)
            </label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
              min="0.1"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              قیمت ورود ($)
            </label>
            <input
              type="number"
              value={entryPrice}
              onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              حد ضرر ($)
            </label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-cyan-500/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateWithBackend}
        disabled={isCalculating}
        className="w-full py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isCalculating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>در حال محاسبه...</span>
          </>
        ) : (
          <>
            <Calculator className="w-4 h-4" />
            <span>محاسبه با سرور</span>
          </>
        )}
      </button>

      {/* Results */}
      <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 mt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-slate-400">نتایج محاسبه</h4>
          {backendResult && (
            <span className="text-xs text-emerald-400">✓ از سرور</span>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">مقدار ریسک:</span>
            <span className="text-lg font-bold text-red-400">
              ${riskAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">حجم پوزیشن:</span>
            <span className="text-lg font-bold text-cyan-400">
              {displaySize.toFixed(6)} واحد
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">ارزش پوزیشن:</span>
            <span className="text-lg font-bold text-white">
              ${displayValue.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">درصد حساب:</span>
            <span className="text-lg font-bold text-emerald-400">
              {displayPercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Warning */}
      {displayPercent > 50 && (
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-sm text-amber-400">
            ⚠️ هشدار: حجم پوزیشن بیش از ۵۰٪ حساب است. ریسک بالا!
          </p>
        </div>
      )}
    </div>
  );
};

export default PositionSizer;
