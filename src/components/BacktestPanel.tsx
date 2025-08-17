import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, Play, Settings, TrendingUp, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';

interface BacktestConfig {
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
}

interface BacktestResults {
  backtest_id: string;
  config: BacktestConfig;
  performance_metrics: {
    total_return: number;
    total_return_pct: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    max_drawdown: number;
    max_drawdown_pct: number;
    win_rate: number;
    profit_factor: number;
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    largest_win: number;
    largest_loss: number;
    avg_trade_duration: number;
  };
  equity_curve: Array<{
    timestamp: string;
    portfolio_value: number;
    total_pnl: number;
    total_return_pct: number;
  }>;
  trades: Array<{
    id: string;
    symbol: string;
    action: string;
    entry_price: number;
    exit_price: number;
    quantity: number;
    pnl: number;
    entry_time: string;
    exit_time: string;
  }>;
  monthly_returns: Record<string, number>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const BacktestPanel: React.FC = () => {
  const [config, setConfig] = useState<BacktestConfig>({
    symbol: 'BTCUSDT',
    startDate: '2024-01-01',
    endDate: '2024-02-01',
    initialCapital: 10000
  });

  const [results, setResults] = useState<BacktestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'analysis'>('overview');

  const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT', 'XRPUSDT', 'SOLUSDT'];

  const runBacktest = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      const response = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to run backtest');
      }

      const data = await response.json();
      
      // Get detailed results
      const resultsResponse = await fetch(`/api/backtest/results/${data.backtest_id}`);
      const resultsData = await resultsResponse.json();
      
      setResults(resultsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = async () => {
    if (!results) return;

    try {
      const response = await fetch(`/api/backtest/export/${results.backtest_id}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backtest_${results.backtest_id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    positive?: boolean;
    icon: React.ComponentType<any>;
    description?: string;
  }> = ({ title, value, change, positive, icon: Icon, description }) => (
    <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        </div>
        {change !== undefined && (
          <span className={clsx(
            "text-sm font-medium",
            positive ? "text-green-400" : "text-red-400"
          )}>
            {formatPercentage(change)}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {typeof value === 'number' ? formatCurrency(value) : value}
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Backtest Configuration</h2>
          </div>
          <button
            onClick={runBacktest}
            disabled={isRunning}
            className={clsx(
              "flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all",
              isRunning
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            )}
          >
            <Play className="w-4 h-4" />
            <span>{isRunning ? 'Running...' : 'Run Backtest'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Symbol Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Symbol</label>
            <select
              value={config.symbol}
              onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {symbols.map(symbol => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Initial Capital */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Initial Capital</label>
            <input
              type="number"
              value={config.initialCapital}
              onChange={(e) => setConfig({ ...config, initialCapital: Number(e.target.value) })}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1000"
              step="1000"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <>
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-800/30 backdrop-blur-lg rounded-xl p-1 border border-gray-700/50">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'trades', label: 'Trade Analysis', icon: Target },
              { id: 'analysis', label: 'Performance Analysis', icon: DollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg transition-all flex-1 justify-center",
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Return"
                  value={results.performance_metrics.total_return}
                  change={results.performance_metrics.total_return_pct}
                  positive={results.performance_metrics.total_return > 0}
                  icon={DollarSign}
                  description={`${results.performance_metrics.total_return_pct.toFixed(2)}% return`}
                />
                <MetricCard
                  title="Sharpe Ratio"
                  value={results.performance_metrics.sharpe_ratio.toFixed(3)}
                  icon={TrendingUp}
                  description="Risk-adjusted return"
                />
                <MetricCard
                  title="Win Rate"
                  value={`${results.performance_metrics.win_rate.toFixed(1)}%`}
                  icon={Target}
                  description={`${results.performance_metrics.winning_trades}/${results.performance_metrics.total_trades} trades`}
                />
                <MetricCard
                  title="Max Drawdown"
                  value={`${results.performance_metrics.max_drawdown_pct.toFixed(2)}%`}
                  icon={AlertTriangle}
                  description="Maximum portfolio decline"
                />
              </div>

              {/* Equity Curve Chart */}
              <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Portfolio Equity Curve</h3>
                  <button
                    onClick={exportResults}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <LineChart data={results.equity_curve}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#9CA3AF"
                        tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                      />
                      <YAxis stroke="#9CA3AF" tickFormatter={formatCurrency} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelFormatter={(value) => format(parseISO(value), 'MMM dd, yyyy')}
                        formatter={(value: any) => [formatCurrency(value), 'Portfolio Value']}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="portfolio_value"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                        name="Portfolio Value"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Returns */}
              <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-6">Monthly Returns</h3>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={Object.entries(results.monthly_returns).map(([month, return_pct]) => ({
                      month,
                      return_pct,
                      positive: return_pct > 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${value}%`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [`${value.toFixed(2)}%`, 'Return']}
                      />
                      <Bar 
                        dataKey="return_pct" 
                        fill="#3B82F6"
                        name="Monthly Return"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="space-y-6">
              {/* Trade Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Total Trades"
                  value={results.performance_metrics.total_trades}
                  icon={Target}
                  description="Completed transactions"
                />
                <MetricCard
                  title="Profit Factor"
                  value={results.performance_metrics.profit_factor.toFixed(2)}
                  icon={TrendingUp}
                  description="Gross profit / Gross loss"
                />
                <MetricCard
                  title="Avg Trade Duration"
                  value={`${results.performance_metrics.avg_trade_duration.toFixed(1)}h`}
                  icon={Calendar}
                  description="Average holding period"
                />
              </div>

              {/* Trade Distribution */}
              <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-6">Trade Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Win/Loss Pie Chart */}
                  <div>
                    <h4 className="text-md font-medium text-gray-300 mb-4">Win/Loss Distribution</h4>
                    <div style={{ width: '100%', height: 250 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Winning Trades', value: results.performance_metrics.winning_trades, color: '#10B981' },
                              { name: 'Losing Trades', value: results.performance_metrics.losing_trades, color: '#EF4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: 'Winning Trades', value: results.performance_metrics.winning_trades, color: '#10B981' },
                              { name: 'Losing Trades', value: results.performance_metrics.losing_trades, color: '#EF4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* P&L Distribution */}
                  <div>
                    <h4 className="text-md font-medium text-gray-300 mb-4">Best vs Worst Trades</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-green-300">Largest Win</span>
                          <span className="font-bold text-green-400">
                            {formatCurrency(results.performance_metrics.largest_win)}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-red-300">Largest Loss</span>
                          <span className="font-bold text-red-400">
                            {formatCurrency(results.performance_metrics.largest_loss)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Trades Table */}
              <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Trades</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-400 font-medium py-3">Symbol</th>
                        <th className="text-left text-gray-400 font-medium py-3">Action</th>
                        <th className="text-right text-gray-400 font-medium py-3">Entry</th>
                        <th className="text-right text-gray-400 font-medium py-3">Exit</th>
                        <th className="text-right text-gray-400 font-medium py-3">Quantity</th>
                        <th className="text-right text-gray-400 font-medium py-3">P&L</th>
                        <th className="text-right text-gray-400 font-medium py-3">Entry Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.trades.slice(0, 10).map((trade) => (
                        <tr key={trade.id} className="border-b border-gray-800/50">
                          <td className="py-3 text-white font-medium">{trade.symbol}</td>
                          <td className="py-3">
                            <span className={clsx(
                              "px-2 py-1 rounded-md text-xs font-medium",
                              trade.action === 'BUY' 
                                ? "bg-green-900/50 text-green-300" 
                                : "bg-red-900/50 text-red-300"
                            )}>
                              {trade.action}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-300">{formatCurrency(trade.entry_price)}</td>
                          <td className="py-3 text-right text-gray-300">{formatCurrency(trade.exit_price)}</td>
                          <td className="py-3 text-right text-gray-300">{trade.quantity.toFixed(6)}</td>
                          <td className={clsx(
                            "py-3 text-right font-medium",
                            trade.pnl > 0 ? "text-green-400" : "text-red-400"
                          )}>
                            {formatCurrency(trade.pnl)}
                          </td>
                          <td className="py-3 text-right text-gray-400">
                            {format(parseISO(trade.entry_time), 'MMM dd, HH:mm')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Risk Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                  title="Sortino Ratio"
                  value={results.performance_metrics.sortino_ratio.toFixed(3)}
                  icon={TrendingUp}
                  description="Downside risk-adjusted return"
                />
                <MetricCard
                  title="Max Drawdown"
                  value={formatCurrency(results.performance_metrics.max_drawdown)}
                  icon={AlertTriangle}
                  description={`${results.performance_metrics.max_drawdown_pct.toFixed(2)}% of portfolio`}
                />
                <MetricCard
                  title="Total Trades"
                  value={results.performance_metrics.total_trades}
                  icon={Target}
                  description="Executed transactions"
                />
              </div>

              {/* Performance Analysis */}
              <div className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-white mb-6">Strategy Performance Analysis</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-300 mb-3">Risk-Adjusted Metrics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sharpe Ratio</span>
                          <span className="text-white font-medium">{results.performance_metrics.sharpe_ratio.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sortino Ratio</span>
                          <span className="text-white font-medium">{results.performance_metrics.sortino_ratio.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Drawdown %</span>
                          <span className="text-red-400 font-medium">{results.performance_metrics.max_drawdown_pct.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-md font-medium text-gray-300 mb-3">Trading Statistics</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate</span>
                          <span className="text-green-400 font-medium">{results.performance_metrics.win_rate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit Factor</span>
                          <span className="text-white font-medium">{results.performance_metrics.profit_factor.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Avg Trade Duration</span>
                          <span className="text-white font-medium">{results.performance_metrics.avg_trade_duration.toFixed(1)}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BacktestPanel;