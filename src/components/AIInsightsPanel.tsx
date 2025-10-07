import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Lightbulb,
  Sparkles,
  BarChart3,
  FileText,
  Send,
  Loader2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { api } from '../services/api';

interface SentimentAnalysis {
  average_sentiment: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  confidence: number;
  timestamp: string;
}

interface TradingInsights {
  symbol: string;
  timestamp: string;
  technical_analysis: string;
  sentiment_analysis: SentimentAnalysis;
  recommendation: string;
  confidence_score: number;
  risk_assessment: string;
}

interface AIInsightsPanelProps {
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ selectedSymbol, onSymbolChange }) => {
  const [insights, setInsights] = useState<TradingInsights | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'insights' | 'sentiment' | 'chat'>('insights');

  useEffect(() => {
    if (selectedSymbol) {
      loadAIInsights();
    }
  }, [selectedSymbol]);

  const loadAIInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load comprehensive insights from real API
      const [insightsRes, sentimentRes] = await Promise.all([
        api.get(`/api/ai/insights/${selectedSymbol}`),
        api.get(`/api/ai/sentiment/${selectedSymbol}`)
      ]);

      setInsights(insightsRes as TradingInsights);
      setSentiment(sentimentRes as SentimentAnalysis);
      setError(null);
    } catch (err) {
      console.error('Error loading AI insights:', err);
      setError('Failed to load AI insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsAsking(true);
    try {
      const response = await api.post('/api/ai/ask', {
        symbol: selectedSymbol,
        question: question
      });
      
      setAiResponse((response as any).answer || 'No response available');
    } catch (err) {
      console.error('Error asking AI:', err);
      setAiResponse('Failed to get response from AI. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.5) return 'text-green-400';
    if (sentiment < -0.5) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.5) return TrendingUp;
    if (sentiment < -0.5) return TrendingDown;
    return BarChart3;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-50">AI Insights</h2>
              <p className="text-sm text-slate-400">Powered by advanced machine learning</p>
            </div>
          </div>
          
          <motion.button
            onClick={loadAIInsights}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Symbol Selector */}
      <motion.div
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-slate-300 mb-3">Select Symbol</label>
        <select
          value={selectedSymbol}
          onChange={(e) => onSymbolChange?.(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-lg text-slate-50 focus:border-purple-500 focus:outline-none transition-colors"
        >
          <option value="BTCUSDT">Bitcoin (BTC/USDT)</option>
          <option value="ETHUSDT">Ethereum (ETH/USDT)</option>
          <option value="BNBUSDT">Binance Coin (BNB/USDT)</option>
          <option value="SOLUSDT">Solana (SOL/USDT)</option>
          <option value="XRPUSDT">Ripple (XRP/USDT)</option>
          <option value="ADAUSDT">Cardano (ADA/USDT)</option>
        </select>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex border-b border-slate-800">
          {[
            { id: 'insights', label: 'AI Insights', icon: Lightbulb },
            { id: 'sentiment', label: 'Sentiment', icon: BarChart3 },
            { id: 'chat', label: 'Ask AI', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
              <p className="text-slate-400">Loading AI insights...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={loadAIInsights}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-medium transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* Insights Tab */}
          {!isLoading && !error && activeTab === 'insights' && insights && (
            <AnimatePresence mode="wait">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Technical Analysis */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-slate-50">Technical Analysis</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {insights.technical_analysis || 'No technical analysis available.'}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-slate-50">Recommendation</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                    {insights.recommendation || 'No recommendation available.'}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-slate-400">Confidence:</div>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-600 h-full transition-all duration-500"
                        style={{ width: `${insights.confidence_score * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-bold text-purple-400">
                      {(insights.confidence_score * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-lg font-semibold text-slate-50">Risk Assessment</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {insights.risk_assessment || 'No risk assessment available.'}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Sentiment Tab */}
          {!isLoading && !error && activeTab === 'sentiment' && sentiment && (
            <AnimatePresence mode="wait">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Overall Sentiment */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-50 mb-4">Overall Sentiment</h3>
                  <div className="flex items-center justify-between">
                    <div className={`text-4xl font-bold ${getSentimentColor(sentiment.average_sentiment)}`}>
                      {sentiment.average_sentiment >= 0 ? '+' : ''}
                      {(sentiment.average_sentiment * 100).toFixed(1)}%
                    </div>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${
                      sentiment.average_sentiment > 0.5 ? 'from-green-500 to-emerald-600' :
                      sentiment.average_sentiment < -0.5 ? 'from-red-500 to-rose-600' :
                      'from-yellow-500 to-orange-600'
                    } flex items-center justify-center`}>
                      {React.createElement(getSentimentIcon(sentiment.average_sentiment), {
                        className: 'w-8 h-8 text-white'
                      })}
                    </div>
                  </div>
                </div>

                {/* Sentiment Distribution */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Positive</div>
                    <div className="text-2xl font-bold text-green-400">
                      {(sentiment.sentiment_distribution.positive * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Neutral</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {(sentiment.sentiment_distribution.neutral * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                    <div className="text-sm text-slate-400 mb-2">Negative</div>
                    <div className="text-2xl font-bold text-red-400">
                      {(sentiment.sentiment_distribution.negative * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-50">Analysis Confidence</h3>
                    <span className="text-2xl font-bold text-cyan-400">
                      {(sentiment.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500"
                      style={{ width: `${sentiment.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Ask AI Tab */}
          {!isLoading && !error && activeTab === 'chat' && (
            <AnimatePresence mode="wait">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-slate-50 mb-4">Ask AI About {selectedSymbol}</h3>
                  
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isAsking && askQuestion()}
                      placeholder="What would you like to know?"
                      className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-700/50 rounded-lg text-slate-50 placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                      disabled={isAsking}
                    />
                    <motion.button
                      onClick={askQuestion}
                      disabled={isAsking || !question.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isAsking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Ask
                    </motion.button>
                  </div>

                  {aiResponse && (
                    <motion.div
                      className="bg-slate-900/80 rounded-xl p-6 border border-slate-700/50"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-slate-400 mb-2">AI Response:</div>
                          <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                            {aiResponse}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Quick Questions */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'What are the current trends?',
                    'Should I buy or sell?',
                    'What is the risk level?',
                    'What are the support levels?'
                  ].map((q, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setQuestion(q)}
                      className="px-4 py-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 hover:border-purple-500/50 rounded-lg text-slate-300 hover:text-slate-50 text-sm transition-colors text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Empty State */}
          {!isLoading && !error && !insights && activeTab !== 'chat' && (
            <div className="py-12 text-center">
              <Brain className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-2">No AI insights available</p>
              <p className="text-slate-500 text-sm mb-6">Select a symbol and click refresh to load insights</p>
              <button
                onClick={loadAIInsights}
                className="px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 font-medium transition-colors"
              >
                Load Insights
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIInsightsPanel;
