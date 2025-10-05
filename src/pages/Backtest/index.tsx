import { useState } from 'react';
import { TestTube, Play, Download, TrendingUp } from 'lucide-react';
import BacktestPanel from '../../components/BacktestPanel';
import { api } from '../../services/api';

export default function Backtest() {
  const [config, setConfig] = useState({
    symbol: 'BTCUSDT',
    start_date: '2024-01-01',
    end_date: '2024-02-01',
    initial_capital: 10000,
    fee: 0.0005,
    slippage: 0.001,
  });
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const response = await api.post('/api/backtest/run', config);
      setResults(response);
    } catch (error) {
      console.error('Backtest failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportCSV = () => {
    if (!results?.trades) return;

    const headers = ['Date', 'Symbol', 'Action', 'Price', 'Quantity', 'PnL'];
    const rows = results.trades.map((trade: any) => [
      trade.timestamp,
      trade.symbol,
      trade.action,
      trade.price,
      trade.quantity,
      trade.pnl || 0,
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backtest_${config.symbol}_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TestTube className="w-6 h-6 text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Backtest Engine</h1>
              <p className="text-sm text-slate-400">Test strategies against historical data</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Symbol</label>
              <input
                type="text"
                value={config.symbol}
                onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Start Date</label>
              <input
                type="date"
                value={config.start_date}
                onChange={(e) => setConfig({ ...config, start_date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">End Date</label>
              <input
                type="date"
                value={config.end_date}
                onChange={(e) => setConfig({ ...config, end_date: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Initial Capital ($)</label>
              <input
                type="number"
                value={config.initial_capital}
                onChange={(e) => setConfig({ ...config, initial_capital: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Fee (%)</label>
              <input
                type="number"
                step="0.0001"
                value={config.fee}
                onChange={(e) => setConfig({ ...config, fee: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Slippage (%)</label>
              <input
                type="number"
                step="0.0001"
                value={config.slippage}
                onChange={(e) => setConfig({ ...config, slippage: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white ltr-numbers focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRunBacktest}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all"
            >
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run Backtest'}
            </button>

            {results && (
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-white/10 rounded-xl text-white font-medium transition-all"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          {results ? (
            <div className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
                  <div className="text-sm text-slate-400 mb-1">Total Return</div>
                  <div className={`text-2xl font-bold ltr-numbers ${results.metrics?.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.metrics?.total_return >= 0 ? '+' : ''}{(results.metrics?.total_return * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
                  <div className="text-sm text-slate-400 mb-1">Sharpe Ratio</div>
                  <div className="text-2xl font-bold text-white ltr-numbers">
                    {results.metrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
                  <div className="text-sm text-slate-400 mb-1">Max Drawdown</div>
                  <div className="text-2xl font-bold text-red-400 ltr-numbers">
                    {(results.metrics?.max_drawdown * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
                  <div className="text-sm text-slate-400 mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-white ltr-numbers">
                    {(results.metrics?.win_rate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Charts & Tables */}
              <BacktestPanel />
            </div>
          ) : (
            <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5 h-full flex items-center justify-center">
              <div className="text-center text-slate-400">
                <TestTube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No Results Yet</p>
                <p className="text-sm">Configure your backtest and click "Run Backtest"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
