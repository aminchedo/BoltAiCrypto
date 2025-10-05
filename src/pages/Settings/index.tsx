import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { store } from '../../state/store';
import WeightPresetsPanel from '../../components/scanner/WeightPresetsPanel';

export default function Settings() {
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [riskLimits, setRiskLimits] = useState({
    max_position_size: 1000,
    max_portfolio_risk: 0.02,
    max_drawdown: 0.15,
    max_leverage: 3,
  });
  const [scanInterval, setScanInterval] = useState(10000);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [agentStatus, limits, agentConfig] = await Promise.all([
        api.get<{ enabled: boolean }>('/api/agent/status'),
        api.get<any>('/api/risk/limits'),
        api.get<{ scan_interval_ms: number }>('/api/agent/config'),
      ]);

      setAgentEnabled(agentStatus.enabled);
      if (limits) setRiskLimits(limits);
      setScanInterval(agentConfig.scan_interval_ms);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveRiskLimits = async () => {
    setIsSaving(true);
    try {
      await api.put('/api/risk/limits', riskLimits);
      alert('Risk limits saved successfully!');
    } catch (error) {
      console.error('Failed to save risk limits:', error);
      alert('Failed to save risk limits');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveScanInterval = async () => {
    setIsSaving(true);
    try {
      await api.put(`/api/agent/config?scan_interval_ms=${scanInterval}`);
      alert('Scan interval updated successfully!');
    } catch (error) {
      console.error('Failed to update scan interval:', error);
      alert('Failed to update scan interval');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400">Configure agent, risk limits, and weights</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Settings */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <h2 className="text-lg font-semibold text-white mb-4">Agent Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Real-Time Agent</div>
                <div className="text-sm text-slate-400">Enable live scanning and WebSocket streaming</div>
              </div>
              <div className={`px-4 py-2 rounded-lg font-medium ${agentEnabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/20 text-slate-400'}`}>
                {agentEnabled ? 'ON' : 'OFF'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Scan Interval (ms)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={scanInterval}
                  onChange={(e) => setScanInterval(parseInt(e.target.value))}
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={handleSaveScanInterval}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-medium transition-all disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Recommended: 10000ms (10 seconds)</p>
            </div>
          </div>
        </div>

        {/* Risk Limits */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <h2 className="text-lg font-semibold text-white mb-4">Risk Limits</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Max Position Size ($)
              </label>
              <input
                type="number"
                value={riskLimits.max_position_size}
                onChange={(e) => setRiskLimits({ ...riskLimits, max_position_size: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Max Portfolio Risk (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={riskLimits.max_portfolio_risk * 100}
                onChange={(e) => setRiskLimits({ ...riskLimits, max_portfolio_risk: parseFloat(e.target.value) / 100 })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Max Drawdown (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={riskLimits.max_drawdown * 100}
                onChange={(e) => setRiskLimits({ ...riskLimits, max_drawdown: parseFloat(e.target.value) / 100 })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Max Leverage
              </label>
              <input
                type="number"
                value={riskLimits.max_leverage}
                onChange={(e) => setRiskLimits({ ...riskLimits, max_leverage: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveRiskLimits}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Risk Limits
            </button>
          </div>
        </div>
      </div>

      {/* Weight Presets */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <h2 className="text-lg font-semibold text-white mb-4">Strategy Weights & Presets</h2>
        <WeightPresetsPanel />
      </div>

      {/* Theme Settings (Future) */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <h2 className="text-lg font-semibold text-white mb-4">Theme & Display</h2>
        <div className="text-slate-400 text-sm">
          Theme customization coming soon...
        </div>
      </div>
    </div>
  );
}
