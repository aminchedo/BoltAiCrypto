import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  AlertTriangle,
  Zap,
  Target,
  Shield,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../services/api';
import Loading from '../../components/Loading';

// Lazy load components
const Chart = lazy(() => import('../../components/Chart'));
const SimpleHeatmap = lazy(() => import('../../components/SimpleHeatmap'));
const ConfidenceGauge = lazy(() => import('../../components/ConfidenceGauge'));
const DirectionPill = lazy(() => import('../../components/DirectionPill'));
const ScoreGauge = lazy(() => import('../../components/ScoreGauge'));
const WeightSliders = lazy(() => import('../../components/WeightSliders'));
const ComponentBreakdown = lazy(() => import('../../components/ComponentBreakdown'));

interface EnhancedOverviewProps {
  stats: any;
  onNavigate: (view: string) => void;
}

interface MarketOverview {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  score: number;
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}

interface SignalData {
  symbol: string;
  action: string;
  confidence: number;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  timestamp: string;
}

export default function EnhancedOverview({ stats, onNavigate }: EnhancedOverviewProps) {
  const [marketData, setMarketData] = useState<MarketOverview[]>([]);
  const [activeSignals, setActiveSignals] = useState<SignalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [chartData, setChartData] = useState<any[]>([]);
  const [weights, setWeights] = useState({
    rsi: 0.25,
    macd: 0.25,
    ma: 0.25,
    volume: 0.25
  });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [marketsRes, signalsRes] = await Promise.all([
        api.get('/api/markets/overview').catch(() => ({ markets: [] })),
        api.get('/api/signals/active').catch(() => ({ signals: [] }))
      ]);

      // Transform market data
      if (marketsRes.markets) {
        setMarketData(marketsRes.markets.slice(0, 8));
      }

      // Transform signals data
      if (signalsRes.signals) {
        setActiveSignals(signalsRes.signals.slice(0, 5));
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Use mock data for demo
      setMarketData(generateMockMarketData());
      setActiveSignals(generateMockSignals());
      setIsLoading(false);
    }
  };

  const generateMockMarketData = (): MarketOverview[] => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT', 'DOTUSDT'];
    return symbols.map(symbol => ({
      symbol,
      price: Math.random() * 10000 + 1000,
      change24h: (Math.random() - 0.5) * 10,
      volume: Math.random() * 1000000000,
      score: Math.random() * 100,
      direction: ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)] as 'BUY' | 'SELL' | 'HOLD',
      confidence: Math.random()
    }));
  };

  const generateMockSignals = (): SignalData[] => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT'];
    return symbols.map(symbol => ({
      symbol,
      action: ['BUY', 'SELL'][Math.floor(Math.random() * 2)],
      confidence: 0.7 + Math.random() * 0.3,
      entry_price: Math.random() * 10000 + 1000,
      stop_loss: Math.random() * 10000 + 900,
      take_profit: Math.random() * 10000 + 1100,
      timestamp: new Date().toISOString()
    }));
  };

  const kpiCards = [
    {
      title: 'ارزش کل پرتفوی',
      value: `$${stats.portfolioValue.toLocaleString()}`,
      change: stats.dailyPnL >= 0 ? `+${stats.dailyPnL.toFixed(2)}%` : `${stats.dailyPnL.toFixed(2)}%`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      trend: stats.dailyPnL >= 0 ? 'up' : 'down'
    },
    {
      title: 'سیگنال‌های فعال',
      value: stats.totalSignals,
      change: '+12%',
      icon: Activity,
      color: 'from-cyan-500 to-blue-600',
      trend: 'up'
    },
    {
      title: 'نرخ موفقیت',
      value: `${(stats.winRate * 100).toFixed(1)}%`,
      change: '+5.3%',
      icon: Target,
      color: 'from-purple-500 to-pink-600',
      trend: 'up'
    },
    {
      title: 'سطح ریسک',
      value: stats.riskLevel === 'low' ? 'پایین' : stats.riskLevel === 'medium' ? 'متوسط' : 'بالا',
      change: stats.alerts > 0 ? `${stats.alerts} هشدار` : 'ایمن',
      icon: Shield,
      color: stats.riskLevel === 'low' ? 'from-green-500 to-emerald-600' : 
             stats.riskLevel === 'medium' ? 'from-yellow-500 to-orange-600' : 
             'from-red-500 to-pink-600',
      trend: stats.riskLevel === 'high' ? 'down' : 'up'
    }
  ];

  if (isLoading) {
    return <Loading message="در حال بارگذاری داشبورد..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl px-6 py-5 hover:border-white/20 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10 group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                {card.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={clsx(
                  "text-sm font-medium",
                  card.change.startsWith('+') || card.change === 'ایمن' ? 'text-green-400' : 'text-red-400'
                )}>
                  {card.change}
                </span>
              </div>
            </div>
            <h3 className="text-slate-400 text-sm mb-2">{card.title}</h3>
            <p className="text-3xl font-bold text-white ltr-numbers">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview Table */}
        <div className="lg:col-span-2 bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              نمای کلی بازار
            </h3>
            <button 
              onClick={loadDashboardData}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">نماد</th>
                  <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">قیمت</th>
                  <th className="text-right py-3 px-4 text-slate-400 text-sm font-medium">تغییر 24س</th>
                  <th className="text-center py-3 px-4 text-slate-400 text-sm font-medium">امتیاز</th>
                  <th className="text-center py-3 px-4 text-slate-400 text-sm font-medium">سیگنال</th>
                  <th className="text-center py-3 px-4 text-slate-400 text-sm font-medium">اعتماد</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((market, index) => (
                  <motion.tr
                    key={market.symbol}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedSymbol(market.symbol);
                      onNavigate('price-chart');
                    }}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{market.symbol}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-mono ltr-numbers">
                        ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={clsx(
                        "font-mono font-bold ltr-numbers",
                        market.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      )}>
                        {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <Suspense fallback={<div className="w-12 h-12" />}>
                          <ScoreGauge score={market.score / 100} size={48} />
                        </Suspense>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <Suspense fallback={<span className="text-xs text-slate-500">...</span>}>
                          <DirectionPill direction={market.direction} />
                        </Suspense>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <Suspense fallback={<div className="w-16 h-16" />}>
                          <ConfidenceGauge confidence={market.confidence} size={64} />
                        </Suspense>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Signals Panel */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            سیگنال‌های فعال
          </h3>
          
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
            {activeSignals.map((signal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-700/30 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer hover:bg-slate-700/50"
                onClick={() => onNavigate('signals')}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white">{signal.symbol}</span>
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-semibold",
                    signal.action === 'BUY' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  )}>
                    {signal.action}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ورود:</span>
                    <span className="text-white font-mono ltr-numbers">
                      ${signal.entry_price?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">حد ضرر:</span>
                    <span className="text-red-400 font-mono ltr-numbers">
                      ${signal.stop_loss?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">هدف سود:</span>
                    <span className="text-green-400 font-mono ltr-numbers">
                      ${signal.take_profit?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-slate-400">اعتماد:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full",
                            signal.confidence >= 0.8 ? 'bg-green-400' :
                            signal.confidence >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                          )}
                          style={{ width: `${signal.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-mono text-xs ltr-numbers">
                        {(signal.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts and Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Chart */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-400" />
              نمودار قیمت - {selectedSymbol}
            </h3>
            <button
              onClick={() => onNavigate('price-chart')}
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              مشاهده کامل
            </button>
          </div>
          <Suspense fallback={<Loading message="در حال بارگذاری نمودار..." />}>
            <Chart symbol={selectedSymbol} data={chartData} />
          </Suspense>
        </div>

        {/* Heatmap */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              نقشه حرارتی بازار
            </h3>
            <button
              onClick={() => onNavigate('correlation-heatmap')}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              مشاهده کامل
            </button>
          </div>
          <Suspense fallback={<Loading message="در حال بارگذاری نقشه..." />}>
            <SimpleHeatmap data={marketData.map(m => ({ value: m.score, label: m.symbol }))} />
          </Suspense>
        </div>
      </div>

      {/* Weight Adjustments and Component Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Sliders */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            تنظیم وزن اندیکاتورها
          </h3>
          <Suspense fallback={<Loading message="در حال بارگذاری..." />}>
            <WeightSliders
              weights={weights}
              onChange={setWeights}
            />
          </Suspense>
        </div>

        {/* Component Breakdown */}
        <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            تحلیل اجزای سیگنال
          </h3>
          <Suspense fallback={<Loading message="در حال بارگذاری..." />}>
            <ComponentBreakdown
              components={{
                rsi: 0.8,
                macd: 0.65,
                ma: 0.75,
                volume: 0.6,
                trend: 0.85
              }}
            />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800/30 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          عملیات سریع
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'اسکنر جامع', view: 'scanner', icon: Activity, color: 'cyan' },
            { label: 'هوش مصنوعی', view: 'ai-predictions', icon: Zap, color: 'purple' },
            { label: 'بک‌تست', view: 'backtest', icon: BarChart3, color: 'green' },
            { label: 'پرتفوی', view: 'portfolio-overview', icon: PieChart, color: 'blue' },
            { label: 'نظارت ریسک', view: 'risk-monitor', icon: Shield, color: 'red' },
            { label: 'استراتژی', view: 'strategy-builder', icon: Target, color: 'yellow' }
          ].map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              onClick={() => onNavigate(action.view)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-${action.color}-500/10 border border-${action.color}-500/30 hover:border-${action.color}-500/50 hover:bg-${action.color}-500/20 transition-all duration-200`}
            >
              <action.icon className={`w-6 h-6 text-${action.color}-400`} />
              <span className="text-sm text-slate-300 text-center">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
