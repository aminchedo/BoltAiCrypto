import { useState, useEffect, Suspense, lazy } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, AlertTriangle, RefreshCw } from 'lucide-react';
import SignalCard from '../../components/SignalCard';
import Loading from '../../components/Loading';
import { TradingSignal } from '../../types';
import { api } from '../../services/api';
import { WebSocketManager } from '../../services/websocket';
import { store } from '../../state/store';

const Chart = lazy(() => import('../../components/Chart'));

export default function Dashboard() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [riskStatus, setRiskStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocketManager('/ws/realtime');
    
    // Subscribe to agent status
    const checkAgentStatus = async () => {
      try {
        const status = await api.get<{ enabled: boolean }>('/api/agent/status');
        setAgentEnabled(status.enabled);
        
        if (status.enabled) {
          ws.connect();
          // Subscribe to watchlist symbols
          const state = store.getState();
          ws.send({ action: 'subscribe', symbols: state.symbols });
        }
      } catch (error) {
        console.error('Failed to check agent status:', error);
      }
    };

    checkAgentStatus();

    // Listen for real-time signals
    ws.onMessage((event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'signal') {
          setSignals(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(s => s.symbol === data.signal.symbol);
            if (idx >= 0) {
              updated[idx] = data.signal;
            } else {
              updated.push(data.signal);
            }
            return updated.slice(0, 10); // Keep last 10
          });
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Failed to parse WS message:', error);
      }
    });

    return () => ws.disconnect();
  }, []);

  // Poll risk status
  useEffect(() => {
    const loadRiskStatus = async () => {
      try {
        const data = await api.get('/api/risk/status');
        setRiskStatus(data);
      } catch (error) {
        console.error('Failed to load risk status:', error);
      }
    };

    loadRiskStatus();
    const interval = setInterval(loadRiskStatus, 10000); // Every 10s

    return () => clearInterval(interval);
  }, []);

  const handleRunScan = async () => {
    setIsLoading(true);
    try {
      const state = store.getState();
      const response = await api.post<any>('/api/scanner/run', {
        symbols: state.symbols,
        timeframes: state.timeframes,
      });
      
      // Update signals from scan results
      if (response.results) {
        setSignals(response.results.map((r: any) => ({
          symbol: r.symbol,
          action: r.direction === 'LONG' ? 'BUY' : r.direction === 'SHORT' ? 'SELL' : 'HOLD',
          confidence: r.final_score / 100,
          timestamp: new Date().toISOString(),
        })));
      }
    } catch (error) {
      console.error('Failed to run scan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Total Signals</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white ltr-numbers">{signals.length}</div>
          <div className="text-xs text-green-400 mt-1">Active</div>
        </div>

        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Risk Level</span>
            <AlertTriangle className={`w-5 h-5 ${riskStatus?.risk_level === 'high' ? 'text-red-400' : riskStatus?.risk_level === 'medium' ? 'text-yellow-400' : 'text-green-400'}`} />
          </div>
          <div className="text-3xl font-bold text-white capitalize">{riskStatus?.risk_level || 'Low'}</div>
          <div className="text-xs text-slate-400 mt-1 ltr-numbers">VaR: ${riskStatus?.var_95?.toFixed(0) || '0'}</div>
        </div>

        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Win Rate</span>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-3xl font-bold text-white ltr-numbers">
            {riskStatus?.win_rate ? `${(riskStatus.win_rate * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-xs text-green-400 mt-1">Last 30 days</div>
        </div>

        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Portfolio Value</span>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white ltr-numbers">
            ${riskStatus?.portfolio_value?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {riskStatus?.portfolio_change >= 0 ? (
              <span className="text-green-400 ltr-numbers">+{riskStatus?.portfolio_change?.toFixed(2)}%</span>
            ) : (
              <span className="text-red-400 ltr-numbers">{riskStatus?.portfolio_change?.toFixed(2)}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Quick Actions</h2>
            <p className="text-sm text-slate-400">
              Agent Status: <span className={agentEnabled ? 'text-green-400' : 'text-slate-400'}>{agentEnabled ? 'ON' : 'OFF'}</span>
              {' • '}
              Last Update: <span className="ltr-numbers">{lastUpdate.toLocaleTimeString()}</span>
            </p>
          </div>
          <button
            onClick={handleRunScan}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 rounded-xl text-white font-medium transition-all duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Run Scan Now
          </button>
        </div>
      </div>

      {/* Live Signals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signals Panel */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            Live Signals
          </h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
            {signals.length > 0 ? (
              signals.map((signal) => (
                <SignalCard
                  key={signal.symbol}
                  signal={signal}
                  onAnalyze={(symbol) => console.log('Analyze:', symbol)}
                  onExecute={(sig) => console.log('Execute:', sig)}
                />
              ))
            ) : (
              <div className="text-center text-slate-400 py-12">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No Active Signals</p>
                <p className="text-sm">
                  {agentEnabled ? 'Waiting for signals...' : 'Enable agent or run a scan'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart Panel */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5">
          <h2 className="text-xl font-bold text-white mb-4">Market Overview</h2>
          <Suspense fallback={<Loading message="Loading chart..." />}>
            <Chart
              symbol={signals[0]?.symbol || 'BTCUSDT'}
              data={[]}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
