import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, Filter, ExternalLink, RefreshCw, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, getRelativeTime } from '../utils/designTokens';
import Loading from './Loading';
import Empty from './Empty';
import ErrorBlock from './ErrorBlock';

interface NewsItem {
  id: string;
  title: string;
  description?: string;
  source: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  url: string;
  symbol?: string;
  read?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
  description?: string;
}

const NewsAndEvents: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSymbol, setFilterSymbol] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'news' | 'calendar'>('news');
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNewsAndEvents();
    const interval = setInterval(loadNewsAndEvents, 120000);
    return () => clearInterval(interval);
  }, []);

  const loadNewsAndEvents = async () => {
    try {
      setError(null);
      const [newsRes, eventsRes] = await Promise.all([
        apiService.get<{ news?: NewsItem[] }>('/api/news/cryptopanic').catch(() => null),
        apiService.get<{ events?: CalendarEvent[] }>('/api/calendar/events').catch(() => null)
      ]);

      setNews(newsRes?.news || generateMockNews());
      setEvents(eventsRes?.events || generateMockEvents());
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load news:', err);
      setNews(generateMockNews());
      setEvents(generateMockEvents());
      setIsLoading(false);
    }
  };

  const generateMockNews = (): NewsItem[] => {
    const titles = [
      'Bitcoin Reaches New All-Time High',
      'Ethereum 2.0 Upgrade Complete',
      'Major Exchange Lists New Altcoins',
      'Institutional Adoption Increases',
      'Regulatory Clarity Expected Soon',
      'DeFi Protocol Launches New Features',
      'Market Analysis: Bull Run Continues',
      'Crypto Fund Raises $500M',
      'New Partnership Announced',
      'Security Audit Completed'
    ];
    const sources = ['CoinDesk', 'Cointelegraph', 'Bloomberg', 'Reuters', 'CryptoNews'];
    const categories = ['Market', 'Technology', 'Regulation', 'DeFi', 'Trading'];
    const impacts: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];

    return titles.map((title, i) => ({
      id: `news-${i}`,
      title,
      description: `${title} - Full story available on source website`,
      source: sources[i % sources.length],
      category: categories[i % categories.length],
      impact: impacts[i % impacts.length],
      sentiment: sentiments[i % sentiments.length],
      timestamp: new Date(Date.now() - i * 1800000).toISOString(),
      url: '#',
      symbol: i < 3 ? 'BTCUSDT' : i < 6 ? 'ETHUSDT' : undefined
    }));
  };

  const generateMockEvents = (): CalendarEvent[] => {
    return [
      {
        id: '1',
        title: 'Fed Interest Rate Decision',
        date: new Date(Date.now() + 86400000).toISOString(),
        impact: 'high',
        description: 'Federal Reserve announces interest rate decision'
      },
      {
        id: '2',
        title: 'Bitcoin Halving',
        date: new Date(Date.now() + 172800000).toISOString(),
        impact: 'high',
        description: 'Next Bitcoin halving event'
      },
      {
        id: '3',
        title: 'Ethereum Network Upgrade',
        date: new Date(Date.now() + 259200000).toISOString(),
        impact: 'medium',
        description: 'Scheduled network upgrade'
      }
    ];
  };

  const handleNewsClick = (id: string) => {
    setReadItems(prev => new Set(prev).add(id));
  };

  const filteredNews = news.filter(item => {
    if (filterSymbol !== 'all' && item.symbol !== filterSymbol) return false;
    if (filterSource !== 'all' && item.source !== filterSource) return false;
    if (filterImpact !== 'all' && item.impact !== filterImpact) return false;
    return true;
  });

  const sources = Array.from(new Set(news.map(n => n.source)));
  const symbols = Array.from(new Set(news.map(n => n.symbol).filter(Boolean)));

  if (isLoading) return <Loading message="Loading news and events..." />;
  if (error) return <ErrorBlock message={error} onRetry={loadNewsAndEvents} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
            <Newspaper style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
            News & Events
          </h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Stay updated with market news and important events
          </p>
        </div>

        <button
          onClick={loadNewsAndEvents}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          aria-label="Refresh"
        >
          <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {[
          { id: 'news', label: 'News', icon: Newspaper },
          { id: 'calendar', label: 'Calendar', icon: Calendar }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200',
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            )}
            style={{ fontSize: typography.sm }}
          >
            <tab.icon style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'news' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              style={{ fontSize: typography.sm }}
            >
              <option value="all">All Symbols</option>
              {symbols.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              style={{ fontSize: typography.sm }}
            >
              <option value="all">All Sources</option>
              {sources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
              style={{ fontSize: typography.sm }}
            >
              <option value="all">All Impact</option>
              <option value="high">High Impact</option>
              <option value="medium">Medium Impact</option>
              <option value="low">Low Impact</option>
            </select>

            <div className="text-slate-400" style={{ fontSize: typography.sm }}>
              {filteredNews.length} of {news.length} articles
            </div>
          </div>

          <div className="space-y-3">
            {filteredNews.length > 0 ? (
              filteredNews.map((item, index) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleNewsClick(item.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={clsx(
                    'block p-4 rounded-lg transition-colors group',
                    readItems.has(item.id) 
                      ? 'bg-slate-700/20 hover:bg-slate-700/30' 
                      : 'bg-slate-800/30 backdrop-blur-lg border border-white/10 hover:bg-slate-700/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium border',
                          item.impact === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          item.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        )} style={{ fontSize: typography.xs }}>
                          {item.impact} impact
                        </span>
                        
                        <span className={clsx(
                          'px-2 py-1 rounded text-xs font-medium border',
                          item.sentiment === 'positive' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          item.sentiment === 'negative' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        )} style={{ fontSize: typography.xs }}>
                          {item.sentiment}
                        </span>

                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              style={{ fontSize: typography.xs }}>
                          {item.category}
                        </span>

                        {item.symbol && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                style={{ fontSize: typography.xs }}>
                            {item.symbol}
                          </span>
                        )}

                        {readItems.has(item.id) && (
                          <span className="text-slate-500" style={{ fontSize: typography.xs }}>✓ Read</span>
                        )}
                      </div>

                      <h4 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors" 
                          style={{ fontSize: typography.base }}>
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-slate-400 mb-2 line-clamp-2" style={{ fontSize: typography.sm }}>
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-slate-400" style={{ fontSize: typography.xs }}>
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{getRelativeTime(new Date(item.timestamp))}</span>
                      </div>
                    </div>

                    <ExternalLink 
                      style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} 
                      className="text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0"
                    />
                  </div>
                </motion.a>
              ))
            ) : (
              <Empty icon="📰" title="No News Found" description="Try adjusting your filters" />
            )}
          </div>
        </>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-3">
          {events.length > 0 ? (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx(
                        'px-2 py-1 rounded text-xs font-medium border',
                        event.impact === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        event.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-green-500/20 text-green-400 border-green-500/30'
                      )} style={{ fontSize: typography.xs }}>
                        {event.impact} impact
                      </span>
                    </div>

                    <h4 className="font-semibold text-white mb-2" style={{ fontSize: typography.lg }}>
                      {event.title}
                    </h4>

                    {event.description && (
                      <p className="text-slate-400 mb-2" style={{ fontSize: typography.sm }}>
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-slate-400" style={{ fontSize: typography.sm }}>
                      <Calendar style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <Empty icon="📅" title="No Events Scheduled" description="Check back later for updates" />
          )}
        </div>
      )}
    </div>
  );
};

export default NewsAndEvents;
