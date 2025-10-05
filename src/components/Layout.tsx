import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  GraduationCap, 
  TestTube, 
  Eye, 
  Settings as SettingsIcon, 
  Brain,
  Zap,
  Activity
} from 'lucide-react';
import AgentToggle from './header/AgentToggle';
import WSStatusBadge from './header/WSStatusBadge';
import { wsClient } from '../services/wsClient';
import { store } from '../state/store';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Scanner', path: '/scanner', icon: Search },
  { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { name: 'Training', path: '/training', icon: GraduationCap },
  { name: 'Backtest', path: '/backtest', icon: TestTube },
  { name: 'Watchlist', path: '/watchlist', icon: Eye },
  { name: 'Settings', path: '/settings', icon: SettingsIcon },
  { name: 'AI Analytics', path: '/ai', icon: Brain },
];

export default function Layout() {
  const navigate = useNavigate();
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([]);

  // Load watchlist from store
  useEffect(() => {
    const state = store.getState();
    setWatchlistSymbols(state.symbols);

    const unsubscribe = store.subscribe((newState) => {
      setWatchlistSymbols(newState.symbols);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir="rtl">
      {/* Header */}
      <header className="bg-slate-800/30 border-b border-white/10 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">سیستم معاملاتی HTS</h1>
                  <p className="text-xs text-slate-400">استراتژی ترکیبی پیشرفته</p>
                </div>
              </div>
            </div>

            {/* Right Side - Agent Toggle & WS Badge */}
            <div className="flex items-center gap-4">
              <WSStatusBadge wsManager={wsClient.getManager()} />
              <AgentToggle 
                wsManager={wsClient.getManager()} 
                watchlistSymbols={watchlistSymbols}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-800/20 border-b border-white/5 backdrop-blur-lg sticky top-16 z-40">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-900/50 backdrop-blur-xl mt-12">
        <div className="max-w-[1920px] mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div>© 2025 HTS Trading System. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span>v1.0.0</span>
              <span>•</span>
              <span>استراتژی ترکیبی پیشرفته</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
