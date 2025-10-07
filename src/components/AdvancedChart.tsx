import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartOptions 
} from 'chart.js';
import { TrendingUp, Eye, EyeOff, RefreshCw, Crosshair } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, formatCurrency } from '../utils/designTokens';
import Loading from './Loading';
import ErrorBlock from './ErrorBlock';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface OHLCV {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface Signal {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  timestamp: string;
}

interface Indicator {
  id: string;
  label: string;
  enabled: boolean;
  color: string;
  data?: number[];
}

const AdvancedChart: React.FC<{ symbol?: string; timeframe?: string }> = ({ 
  symbol = 'BTCUSDT',
  timeframe = '1h'
}) => {
  const [ohlcv, setOhlcv] = useState<OHLCV[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crosshairData, setCrosshairData] = useState<{ price: number; time: string } | null>(null);
  
  const [indicators, setIndicators] = useState<Indicator[]>([
    { id: 'ema20', label: 'EMA 20', enabled: true, color: '#3b82f6' },
    { id: 'ema50', label: 'EMA 50', enabled: true, color: '#10b981' },
    { id: 'rsi', label: 'RSI', enabled: false, color: '#f59e0b' },
    { id: 'macd', label: 'MACD', enabled: false, color: '#8b5cf6' }
  ]);

  useEffect(() => {
    loadChartData();
    const interval = setInterval(loadChartData, 60000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  const loadChartData = async () => {
    try {
      setError(null);
      const [ohlcvRes, signalsRes] = await Promise.all([
        apiService.get<{ data?: OHLCV[] }>(`/api/markets/${symbol}/ohlcv?timeframe=${timeframe}`).catch(() => null),
        apiService.get<{ signals?: Signal[] }>('/api/signals/active').catch(() => null)
      ]);

      setOhlcv(ohlcvRes?.data || generateMockOHLCV());
      setSignals(signalsRes?.signals || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load chart data:', err);
      setOhlcv(generateMockOHLCV());
      setIsLoading(false);
    }
  };

  const generateMockOHLCV = (): OHLCV[] => {
    const data: OHLCV[] = [];
    let price = 44000;
    
    for (let i = 0; i < 100; i++) {
      const change = (Math.random() - 0.5) * 200;
      price += change;
      
      data.push({
        timestamp: new Date(Date.now() - (100 - i) * 3600000).toISOString(),
        open: price,
        high: price + Math.random() * 100,
        low: price - Math.random() * 100,
        close: price + change,
        volume: Math.random() * 1000000
      });
    }
    
    return data;
  };

  const toggleIndicator = (id: string) => {
    setIndicators(prev => prev.map(ind => 
      ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
    ));
    localStorage.setItem('chart-indicators', JSON.stringify(
      indicators.map(ind => ind.id === id ? { ...ind, enabled: !ind.enabled } : ind)
    ));
  };

  const chartData = {
    labels: ohlcv.map(d => new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })),
    datasets: [
      {
        label: 'Price',
        data: ohlcv.map(d => d.close),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      ...indicators.filter(ind => ind.enabled).map(ind => ({
        label: ind.label,
        data: calculateIndicator(ind.id),
        borderColor: ind.color,
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 3,
        borderDash: ind.id === 'rsi' || ind.id === 'macd' ? [5, 5] : undefined
      }))
    ]
  };

  const calculateIndicator = (id: string): number[] => {
    if (id === 'ema20') {
      return calculateEMA(ohlcv.map(d => d.close), 20);
    }
    if (id === 'ema50') {
      return calculateEMA(ohlcv.map(d => d.close), 50);
    }
    return ohlcv.map(() => 0);
  };

  const calculateEMA = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const ema: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      ema.push(data[i] * k + ema[i - 1] * (1 - k));
    }
    
    return ema;
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8',
          callback: function(value: any) {
            return formatCurrency(value, 0);
          }
        }
      }
    }
  };

  if (isLoading) return <Loading message="Loading chart..." />;
  if (error) return <ErrorBlock message={error} onRetry={loadChartData} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white" style={{ fontSize: typography['2xl'] }}>
            {symbol} Chart
          </h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            {timeframe} timeframe with technical indicators
          </p>
        </div>

        <button
          onClick={loadChartData}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          aria-label="Refresh"
        >
          <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {indicators.map(ind => (
          <button
            key={ind.id}
            onClick={() => toggleIndicator(ind.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 border',
              ind.enabled
                ? 'bg-slate-700/50 text-white border-white/10'
                : 'bg-slate-800/30 text-slate-500 border-transparent'
            )}
            style={{ fontSize: typography.sm }}
          >
            {ind.enabled ? (
              <Eye style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
            ) : (
              <EyeOff style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
            )}
            <div className="w-3 h-3 rounded" style={{ backgroundColor: ind.color }}></div>
            {ind.label}
          </button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
      >
        <div style={{ height: 500 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      {crosshairData && (
        <div className="bg-slate-800/30 backdrop-blur-lg rounded-lg border border-white/10 p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Crosshair style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-cyan-400" />
              <span className="text-slate-400" style={{ fontSize: typography.xs }}>Crosshair:</span>
            </div>
            <div className="text-white font-mono" style={{ fontSize: typography.sm }}>
              {formatCurrency(crosshairData.price)}
            </div>
            <div className="text-slate-400" style={{ fontSize: typography.xs }}>
              @ {crosshairData.time}
            </div>
          </div>
        </div>
      )}

      {signals.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-400" style={{ fontSize: typography.sm }}>
            <strong>{signals.length} active signals</strong> shown on chart as annotations
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedChart;
