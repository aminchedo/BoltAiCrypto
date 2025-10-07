import React, { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, TrendingDown, ExternalLink, RefreshCw, Twitter, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { apiService } from '../services/api';
import { dimensions, spacing, typography, getRelativeTime } from '../utils/designTokens';
import Loading from './Loading';
import ErrorBlock from './ErrorBlock';

interface SentimentData {
  overall_score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  news_sentiment: number;
  social_sentiment: number;
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: string;
  url: string;
}

const SentimentOverview: React.FC<{ symbol?: string }> = ({ symbol = 'BTCUSDT' }) => {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'news' | 'social'>('news');

  useEffect(() => {
    loadSentimentData();
    const interval = setInterval(loadSentimentData, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  const loadSentimentData = async () => {
    try {
      setError(null);
      const [sentimentRes, newsRes] = await Promise.all([
        apiService.get<SentimentData>(`/api/ai/sentiment/${symbol}`).catch(() => null),
        apiService.get<{ news?: NewsItem[] }>('/api/news/cryptopanic').catch(() => null)
      ]);

      setSentiment(sentimentRes || generateMockSentiment());
      setNews(newsRes?.news || generateMockNews());
      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load sentiment:', err);
      setSentiment(generateMockSentiment());
      setNews(generateMockNews());
      setIsLoading(false);
    }
  };

  const generateMockSentiment = (): SentimentData => ({
    overall_score: 0.65,
    sentiment: 'bullish',
    confidence: 0.78,
    news_sentiment: 0.62,
    social_sentiment: 0.68,
    trend: 'up',
    last_updated: new Date().toISOString()
  });

  const generateMockNews = (): NewsItem[] => {
    const titles = [
      'Bitcoin Reaches New Monthly High',
      'Institutional Adoption Increases',
      'Market Analysis: Bullish Signals',
      'Ethereum Upgrade Successful',
      'Regulatory Clarity Expected',
      'Major Exchange Lists New Assets'
    ];
    const sources = ['CoinDesk', 'Cointelegraph', 'Bloomberg', 'Reuters'];
    const sentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];

    return titles.map((title, i) => ({
      id: `news-${i}`,
      title,
      source: sources[i % sources.length],
      sentiment: sentiments[i % sentiments.length],
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      url: '#'
    }));
  };

  if (isLoading) return <Loading message="Loading sentiment data..." />;
  if (error) return <ErrorBlock message={error} onRetry={loadSentimentData} />;
  if (!sentiment) return null;

  const getSentimentColor = (sent: string) => {
    if (sent === 'bullish' || sent === 'positive') return 'text-green-400';
    if (sent === 'bearish' || sent === 'negative') return 'text-red-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white flex items-center gap-2" style={{ fontSize: typography['2xl'] }}>
            <MessageSquare style={{ width: dimensions.iconSize.lg, height: dimensions.iconSize.lg }} className="text-cyan-400" />
            Sentiment Analysis
          </h2>
          <p className="text-slate-400" style={{ fontSize: typography.sm }}>
            Market sentiment for {symbol} • {getRelativeTime(new Date(sentiment.last_updated))}
          </p>
        </div>

        <button
          onClick={loadSentimentData}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          aria-label="Refresh"
        >
          <RefreshCw style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Overall Sentiment</span>
            {sentiment.trend === 'up' ? (
              <TrendingUp style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-green-400" />
            ) : sentiment.trend === 'down' ? (
              <TrendingDown style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-red-400" />
            ) : (
              <div className="w-0.5 h-4 bg-slate-400"></div>
            )}
          </div>

          <div className={clsx('font-bold capitalize mb-2', getSentimentColor(sentiment.sentiment))} 
               style={{ fontSize: typography['3xl'] }}>
            {sentiment.sentiment}
          </div>

          <div className="text-slate-400 mb-3" style={{ fontSize: typography.sm }}>
            Score: {(sentiment.overall_score * 100).toFixed(0)}/100
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className={clsx(
                'h-2 rounded-full transition-all duration-500',
                sentiment.sentiment === 'bullish' ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                sentiment.sentiment === 'bearish' ? 'bg-gradient-to-r from-red-500 to-red-400' :
                'bg-gradient-to-r from-slate-500 to-slate-400'
              )}
              style={{ width: `${sentiment.overall_score * 100}%` }}
            />
          </div>

          <div className="mt-4 text-slate-400" style={{ fontSize: typography.xs }}>
            Confidence: {(sentiment.confidence * 100).toFixed(0)}%
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-blue-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>News Sentiment</span>
          </div>

          <div className={clsx('font-bold mb-2', getSentimentColor(sentiment.news_sentiment > 0.5 ? 'positive' : 'negative'))} 
               style={{ fontSize: typography['3xl'] }}>
            {(sentiment.news_sentiment * 100).toFixed(0)}
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sentiment.news_sentiment * 100}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Twitter style={{ width: dimensions.iconSize.md, height: dimensions.iconSize.md }} className="text-purple-400" />
            <span className="text-slate-400" style={{ fontSize: typography.sm }}>Social Sentiment</span>
          </div>

          <div className={clsx('font-bold mb-2', getSentimentColor(sentiment.social_sentiment > 0.5 ? 'positive' : 'negative'))} 
               style={{ fontSize: typography['3xl'] }}>
            {(sentiment.social_sentiment * 100).toFixed(0)}
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${sentiment.social_sentiment * 100}%` }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-800/30 backdrop-blur-lg rounded-xl border border-white/10 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          {[
            { id: 'news', label: 'News', icon: Globe },
            { id: 'social', label: 'Social', icon: Twitter }
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

        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-600">
          {news.map((item, index) => (
            <motion.a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="block p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={clsx(
                      'px-2 py-1 rounded text-xs font-medium border',
                      item.sentiment === 'positive' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      item.sentiment === 'negative' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    )} style={{ fontSize: typography.xs }}>
                      {item.sentiment}
                    </span>
                    <span className="text-slate-400" style={{ fontSize: typography.xs }}>{item.source}</span>
                  </div>

                  <h4 className="font-medium text-white mb-2 group-hover:text-cyan-400 transition-colors" 
                      style={{ fontSize: typography.base }}>
                    {item.title}
                  </h4>

                  <div className="text-slate-400" style={{ fontSize: typography.xs }}>
                    {getRelativeTime(new Date(item.timestamp))}
                  </div>
                </div>

                <ExternalLink 
                  style={{ width: dimensions.iconSize.sm, height: dimensions.iconSize.sm }} 
                  className="text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0"
                />
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SentimentOverview;
