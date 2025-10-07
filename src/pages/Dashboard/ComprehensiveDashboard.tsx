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
  MessageSquare,
  Bell,
  Download
} from 'lucide-react';
import clsx from 'clsx';
import Loading from '../../components/Loading';
import EnhancedOverview from './EnhancedOverview';
import AssetSelector from '../../components/AssetSelector';
import { api } from '../../services/api';
import { wsClient } from '../../services/wsClient';
import { store } from '../../state/store';
import { dimensions, spacing, typography, breakpoints, getRelativeTime } from '../../utils/designTokens';

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
  const [favorites, setFavorites] = useState<string[]>(['BTCUSDT', 'ETHUSDT']);
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

  const handleToggleFavorite = (symbol: string) => {
    setFavorites(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? dimensions.sidebar.collapsed : dimensions.sidebar.expanded }}
        className="bg-slate-800/30 border-r border-white/10 backdrop-blur-xl flex flex-col relative z-10"
        style={{ minWidth: sidebarCollapsed ? dimensions.sidebar.collapsed : dimensions.sidebar.expanded }}
      >
        {/* Sidebar Header */}
        <div className="border-b border-white/10" style={{ padding: spacing.md }}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600" 
                     style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }}>
                  <Zap style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white" style={{ fontSize: typography.base }}>HTS Pro</h1>
                  <p className="text-slate-400" style={{ fontSize: typography.xs }}>Trading System</p>
                </div>
              </motion.div>
            )}
            {sidebarCollapsed && (
              <div className="flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 mx-auto" 
                   style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }}>
                <Zap style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? 
                <ChevronRight style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} /> : 
                <ChevronLeft style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} />
              }
            </button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="border-b border-white/10" style={{ padding: `${spacing.sm} ${spacing.md}` }}>
          <div className="flex items-center gap-2">
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full",
              isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"
            )} />
            {!sidebarCollapsed && (
              <span className="text-slate-400" style={{ fontSize: typography.xs }}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600" style={{ padding: `${spacing.md} ${spacing.sm}` }}>
          <ul className="space-y-0.5">
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
        <div className="border-t border-white/10" style={{ padding: spacing.md }}>
          <button
            onClick={() => setActiveView('settings')}
            className={clsx(
              "w-full flex items-center gap-2 rounded-lg transition-all duration-200",
              activeView === 'settings'
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                : "text-slate-400 hover:text-white hover:bg-white/10"
            )}
            style={{ padding: `${spacing.sm} ${spacing.md}` }}
          >
            <Settings style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium" style={{ fontSize: typography.sm }}>Settings</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Compact Header ≤64px */}
        <header 
          className="bg-slate-800/30 border-b border-white/10 backdrop-blur-xl flex items-center justify-between"
          style={{ height: dimensions.header.height, paddingLeft: spacing.xl, paddingRight: spacing.xl }}
        >
          {/* Left: Brand + Breadcrumb */}
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-white" style={{ fontSize: typography.lg }}>
              {menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
            </h2>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>
              {getRelativeTime(lastUpdate)}
            </span>
          </div>

          {/* Right: Asset Selector + Actions */}
          <div className="flex items-center gap-3">
            {/* Asset Selector */}
            <AssetSelector
              selected={selectedSymbol}
              onSelect={setSelectedSymbol}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5 bg-slate-700/30 rounded-lg border border-white/10" style={{ padding: `${spacing.sm} ${spacing.md}` }}>
              <button
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                aria-label="Notifications"
              >
                <Bell style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
              </button>
              <button
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                aria-label="Export data"
              >
                <Download style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
              </button>
              <button
                onClick={loadDashboardStats}
                className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                aria-label="Refresh"
              >
                <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
              </button>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-3 bg-slate-700/30 rounded-lg border border-white/10" style={{ padding: `${spacing.sm} ${spacing.md}` }}>
              <div className="flex items-center gap-1.5">
                <Activity style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-cyan-400" />
                <span className="text-slate-300" style={{ fontSize: typography.xs }}>{stats.totalSignals}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} className="text-green-400" />
                <span className="text-slate-300 ltr-numbers" style={{ fontSize: typography.xs }}>
                  ${(stats.portfolioValue / 1000).toFixed(1)}K
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield 
                  style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }}
                  className={clsx(
                    stats.riskLevel === 'low' ? 'text-green-400' :
                    stats.riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  )} 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600" style={{ padding: spacing.xl }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
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
          "w-full flex items-center gap-2 rounded-lg transition-all duration-200 group",
          active
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
            : "text-slate-400 hover:text-white hover:bg-white/10"
        )}
        style={{ 
          padding: `${spacing.sm} ${spacing.md}`,
          paddingLeft: `${parseFloat(spacing.md) * (1 + depth)}rem`
        }}
      >
        <item.icon style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="font-medium flex-1 text-right" style={{ fontSize: typography.sm }}>{item.label}</span>
            {item.badge && (
              <span 
                className="px-1.5 py-0.5 font-semibold bg-red-500/20 text-red-400 rounded-full border border-red-500/30"
                style={{ fontSize: typography.xs }}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
      
      {/* Children */}
      {hasChildren && expanded && !collapsed && (
        <ul className="mt-0.5 space-y-0.5">
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
