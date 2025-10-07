import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  Brain,
  PieChart,
  TestTube,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  Target,
  Shield,
  BarChart3,
  Layers,
  Box as BoxIcon,
  Gauge,
  Zap,
  Eye,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  Sliders,
  LineChart,
  Sparkles,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import clsx from 'clsx';
import Loading from '../../components/Loading';
import EnhancedOverview from './EnhancedOverview';
import { api } from '../../services/api';
import { wsClient } from '../../services/wsClient';
import { store } from '../../state/store';

// Lazy load heavy components for better performance
const Scanner = lazy(() => import('../Scanner'));
const PredictiveAnalyticsDashboard = lazy(() => import('../../components/PredictiveAnalyticsDashboard'));
const Chart = lazy(() => import('../../components/Chart'));
const AIInsightsPanel = lazy(() => import('../../components/AIInsightsPanel'));
const RealTimeRiskMonitor = lazy(() => import('../../components/RealTimeRiskMonitor'));
const MarketVisualization3D = lazy(() => import('../../components/MarketVisualization3D'));
const CorrelationHeatMap = lazy(() => import('../../components/CorrelationHeatMap'));
const MarketDepthChart = lazy(() => import('../../components/MarketDepthChart'));
const PortfolioPanel = lazy(() => import('../../components/PortfolioPanel'));
const BacktestPanel = lazy(() => import('../../components/BacktestPanel'));
const PnLDashboard = lazy(() => import('../../components/PnLDashboard'));
const StrategyBuilder = lazy(() => import('../../components/StrategyBuilder'));
const RiskPanel = lazy(() => import('../../components/RiskPanel'));
const PositionSizer = lazy(() => import('../../components/PositionSizer'));
const MarketScanner = lazy(() => import('../../components/MarketScanner'));
const SignalDetails = lazy(() => import('../../components/SignalDetails'));

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  children?: MenuItem[];
}

interface DashboardStats {
  totalSignals: number;
  activePositions: number;
  portfolioValue: number;
  dailyPnL: number;
  winRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  alerts: number;
}

export default function ComprehensiveDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<string>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalSignals: 0,
    activePositions: 0,
    portfolioValue: 0,
    dailyPnL: 0,
    winRate: 0,
    riskLevel: 'low',
    alerts: 0
  });
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Menu structure with all available components
  const menuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'نمای کلی',
      icon: LayoutDashboard,
      badge: stats.alerts > 0 ? stats.alerts : undefined
    },
    {
      id: 'scanner',
      label: 'اسکنر جامع',
      icon: Search,
      badge: 'جدید'
    },
    {
      id: 'ai-analytics',
      label: 'تحلیل هوش مصنوعی',
      icon: Brain,
      children: [
        { id: 'ai-predictions', label: 'پیش‌بینی‌های هوشمند', icon: Sparkles },
        { id: 'ai-insights', label: 'بینش‌های AI', icon: Lightbulb },
        { id: 'sentiment', label: 'تحلیل احساسات', icon: MessageSquare }
      ]
    },
    {
      id: 'trading',
      label: 'معاملات',
      icon: TrendingUp,
      children: [
        { id: 'signals', label: 'سیگنال‌های فعال', icon: Activity },
        { id: 'positions', label: 'پوزیشن‌ها', icon: Target },
        { id: 'market-scanner', label: 'اسکنر ساده', icon: Search },
        { id: 'strategy-builder', label: 'سازنده استراتژی', icon: Sliders }
      ]
    },
    {
      id: 'visualization',
      label: 'نمایش بصری',
      icon: Eye,
      children: [
        { id: '3d-market', label: 'نمای سه‌بعدی بازار', icon: BoxIcon },
        { id: 'correlation-heatmap', label: 'نقشه حرارتی همبستگی', icon: Layers },
        { id: 'market-depth', label: 'عمق بازار', icon: BarChart3 },
        { id: 'price-chart', label: 'نمودار قیمت', icon: LineChart }
      ]
    },
    {
      id: 'portfolio',
      label: 'مدیریت پرتفوی',
      icon: PieChart,
      children: [
        { id: 'portfolio-overview', label: 'نمای کلی پرتفوی', icon: PieChart },
        { id: 'pnl-dashboard', label: 'تحلیل سود و زیان', icon: DollarSign },
        { id: 'position-sizer', label: 'محاسبه حجم معامله', icon: Gauge }
      ]
    },
    {
      id: 'risk',
      label: 'مدیریت ریسک',
      icon: Shield,
      children: [
        { id: 'risk-monitor', label: 'نظارت ریسک لحظه‌ای', icon: Activity },
        { id: 'risk-panel', label: 'پنل ریسک', icon: AlertTriangle },
        { id: 'risk-settings', label: 'تنظیمات ریسک', icon: Settings }
      ]
    },
    {
      id: 'backtest',
      label: 'بک‌تست و آزمایش',
      icon: TestTube,
      badge: stats.activePositions
    },
    {
      id: 'education',
      label: 'آموزش و راهنما',
      icon: BookOpen,
    }
  ];

  // Load dashboard statistics
  useEffect(() => {
    loadDashboardStats();
    const interval = setInterval(loadDashboardStats, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = wsClient.getManager();
    
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'stats_update') {
          setStats(prev => ({ ...prev, ...data.stats }));
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.addEventListener('message', handleMessage);
    setIsConnected(ws.readyState === WebSocket.OPEN);

    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [signalsData, portfolioData, riskData] = await Promise.all([
        api.get('/api/signals/active').catch(() => ({ signals: [] })),
        api.get('/api/portfolio/summary').catch(() => ({ value: 0, pnl: 0 })),
        api.get('/api/risk/status').catch(() => ({ risk_level: 'low', alerts: 0 }))
      ]);

      setStats({
        totalSignals: signalsData.signals?.length || 0,
        activePositions: portfolioData.positions?.length || 0,
        portfolioValue: portfolioData.value || 0,
        dailyPnL: portfolioData.pnl || 0,
        winRate: portfolioData.win_rate || 0,
        riskLevel: riskData.risk_level || 'low',
        alerts: riskData.alerts || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return <EnhancedOverview stats={stats} onNavigate={setActiveView} />;
      case 'scanner':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری اسکنر جامع..." />}>
            <Scanner />
          </Suspense>
        );
      case 'ai-predictions':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری تحلیل‌های هوشمند..." />}>
            <PredictiveAnalyticsDashboard />
          </Suspense>
        );
      case 'ai-insights':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری بینش‌های هوش مصنوعی..." />}>
            <AIInsightsPanel selectedSymbol={selectedSymbol} />
          </Suspense>
        );
      case 'risk-monitor':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری نظارت ریسک..." />}>
            <RealTimeRiskMonitor />
          </Suspense>
        );
      case '3d-market':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری نمایش سه‌بعدی..." />}>
            <MarketVisualization3D marketData={[]} />
          </Suspense>
        );
      case 'correlation-heatmap':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری نقشه حرارتی..." />}>
            <CorrelationHeatMap />
          </Suspense>
        );
      case 'market-depth':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری عمق بازار..." />}>
            <MarketDepthChart symbol={selectedSymbol} />
          </Suspense>
        );
      case 'price-chart':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری نمودار..." />}>
            <Chart symbol={selectedSymbol} data={[]} />
          </Suspense>
        );
      case 'portfolio-overview':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری پرتفوی..." />}>
            <PortfolioPanel />
          </Suspense>
        );
      case 'pnl-dashboard':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری تحلیل P&L..." />}>
            <PnLDashboard />
          </Suspense>
        );
      case 'position-sizer':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری محاسبه‌گر..." />}>
            <PositionSizer />
          </Suspense>
        );
      case 'backtest':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری بک‌تست..." />}>
            <BacktestPanel />
          </Suspense>
        );
      case 'strategy-builder':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری سازنده استراتژی..." />}>
            <StrategyBuilder />
          </Suspense>
        );
      case 'risk-panel':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری پنل ریسک..." />}>
            <RiskPanel />
          </Suspense>
        );
      case 'market-scanner':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری اسکنر ساده..." />}>
            <MarketScanner onOpenDetails={(symbol) => {
              setSelectedSymbol(symbol);
              setActiveView('signal-details');
            }} />
          </Suspense>
        );
      case 'signal-details':
        return (
          <Suspense fallback={<Loading message="در حال بارگذاری جزئیات..." />}>
            <SignalDetails 
              symbol={selectedSymbol} 
              onBack={() => setActiveView('market-scanner')} 
            />
          </Suspense>
        );
      default:
        return <EnhancedOverview stats={stats} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        className="bg-slate-800/30 border-r border-white/10 backdrop-blur-xl flex flex-col relative z-10"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">HTS</h1>
                  <p className="text-xs text-slate-400">Pro Trading</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={clsx(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            )} />
            {!sidebarCollapsed && (
              <span className="text-xs text-slate-400">
                {isConnected ? 'متصل' : 'قطع شده'}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                collapsed={sidebarCollapsed}
                active={activeView === item.id}
                onClick={() => setActiveView(item.id)}
              />
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setActiveView('settings')}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
              activeView === 'settings'
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-sm font-medium">تنظیمات</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-slate-800/30 border-b border-white/10 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {menuItems.find(m => m.id === activeView)?.label || 'داشبورد'}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                آخرین بروزرسانی: {lastUpdate.toLocaleTimeString('fa-IR')}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="flex items-center gap-6 px-6 py-3 bg-slate-700/30 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300">{stats.totalSignals} سیگنال</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300 ltr-numbers">
                    ${stats.portfolioValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className={clsx(
                    "w-4 h-4",
                    stats.riskLevel === 'low' ? 'text-green-400' :
                    stats.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  )} />
                  <span className="text-sm text-slate-300 capitalize">{stats.riskLevel}</span>
                </div>
              </div>

              <button
                onClick={loadDashboardStats}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Menu Item Component with children support
function MenuItem({ 
  item, 
  collapsed, 
  active, 
  onClick,
  depth = 0 
}: { 
  item: MenuItem; 
  collapsed: boolean; 
  active: boolean; 
  onClick: () => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <li>
      <button
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else {
            onClick();
          }
        }}
        className={clsx(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
          active
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
            : "text-slate-400 hover:text-white hover:bg-white/10"
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1 text-right">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
      
      {/* Children */}
      {hasChildren && expanded && !collapsed && (
        <ul className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              collapsed={collapsed}
              active={active}
              onClick={onClick}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
