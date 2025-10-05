import React from 'react';
import { Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScanResult } from '../../types';

interface TimeframeBreakdownPanelProps {
  result: ScanResult;
}

interface TimeframeScore {
  timeframe: string;
  score: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  weight: number;
}

const TimeframeBreakdownPanel: React.FC<TimeframeBreakdownPanelProps> = ({ result }) => {
  // Extract timeframe scores from result
  const timeframeScores: TimeframeScore[] = [];
  
  // Check if result has timeframe breakdown data
  if (result.timeframe_breakdown) {
    Object.entries(result.timeframe_breakdown).forEach(([tf, data]: [string, any]) => {
      timeframeScores.push({
        timeframe: tf,
        score: data.score || 0,
        direction: data.direction || 'NEUTRAL',
        weight: getTimeframeWeight(tf)
      });
    });
  } else if (result.timeframes) {
    // Fallback: use available timeframes with overall score
    result.timeframes.forEach(tf => {
      timeframeScores.push({
        timeframe: tf,
        score: result.overall_score || result.score || 0,
        direction: result.overall_direction || result.direction || 'NEUTRAL',
        weight: getTimeframeWeight(tf)
      });
    });
  }

  // Calculate weighted consensus
  const totalWeight = timeframeScores.reduce((sum, tf) => sum + tf.weight, 0);
  const weightedScore = timeframeScores.reduce((sum, tf) => sum + (tf.score * tf.weight), 0) / (totalWeight || 1);
  
  // Determine consensus direction
  const bullishWeight = timeframeScores
    .filter(tf => tf.direction === 'BULLISH')
    .reduce((sum, tf) => sum + tf.weight, 0);
  const bearishWeight = timeframeScores
    .filter(tf => tf.direction === 'BEARISH')
    .reduce((sum, tf) => sum + tf.weight, 0);
  
  const consensusDirection = bullishWeight > bearishWeight ? 'BULLISH' : 
                            bearishWeight > bullishWeight ? 'BEARISH' : 'NEUTRAL';

  // Helper to get timeframe weight (higher timeframes get more weight)
  function getTimeframeWeight(tf: string): number {
    const weights: Record<string, number> = {
      '1m': 0.05,
      '5m': 0.10,
      '15m': 0.15,
      '30m': 0.20,
      '1h': 0.25,
      '4h': 0.35,
      '1d': 0.45,
      '1w': 0.50
    };
    return weights[tf] || 0.25;
  }

  // Get direction icon
  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'BULLISH':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'BEARISH':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  // Get direction color
  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'BULLISH':
        return 'text-emerald-400';
      case 'BEARISH':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  if (timeframeScores.length === 0) {
    return (
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <div className="text-center text-slate-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>اطلاعات بازه‌های زمانی در دسترس نیست</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weighted Consensus Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            اجماع وزن‌دار بازه‌های زمانی
          </h3>
          <div className={`flex items-center gap-2 ${getDirectionColor(consensusDirection)}`}>
            {getDirectionIcon(consensusDirection)}
            <span className="font-semibold">{consensusDirection}</span>
          </div>
        </div>

        {/* Consensus Score */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">امتیاز اجماع</span>
              <span className="text-2xl font-bold text-white ltr-numbers">
                {(weightedScore * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-4 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${
                  weightedScore >= 0.7 ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                  weightedScore >= 0.4 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${weightedScore * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Direction Distribution */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">صعودی</div>
            <div className="text-lg font-bold text-emerald-400 ltr-numbers">
              {((bullishWeight / totalWeight) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">خنثی</div>
            <div className="text-lg font-bold text-slate-400 ltr-numbers">
              {(((totalWeight - bullishWeight - bearishWeight) / totalWeight) * 100).toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 mb-1">نزولی</div>
            <div className="text-lg font-bold text-red-400 ltr-numbers">
              {((bearishWeight / totalWeight) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Individual Timeframe Scores */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">امتیاز بازه‌های زمانی فردی</h3>
        
        <div className="space-y-3">
          {timeframeScores
            .sort((a, b) => b.weight - a.weight) // Sort by weight (higher timeframes first)
            .map((tf) => (
              <div
                key={tf.timeframe}
                className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white font-mono">
                      {tf.timeframe}
                    </span>
                    {getDirectionIcon(tf.direction)}
                    <span className={`text-sm font-medium ${getDirectionColor(tf.direction)}`}>
                      {tf.direction}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">وزن</div>
                      <div className="text-sm font-mono text-slate-300 ltr-numbers">
                        {(tf.weight * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">امتیاز</div>
                      <div className={`text-lg font-bold ltr-numbers ${
                        tf.score >= 0.7 ? 'text-emerald-400' :
                        tf.score >= 0.4 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {(tf.score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="w-full h-2 bg-slate-600/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      tf.score >= 0.7 ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                      tf.score >= 0.4 ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                      'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{ width: `${tf.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-2">💡 درباره اجماع وزن‌دار</h4>
        <p className="text-xs text-slate-400">
          امتیاز اجماع با استفاده از میانگین وزن‌دار بازه‌های زمانی محاسبه می‌شود. 
          بازه‌های بالاتر (مانند 4h و 1d) وزن بیشتری دارند زیرا روندهای قوی‌تر را نشان می‌دهند.
        </p>
      </div>
    </div>
  );
};

export default TimeframeBreakdownPanel;
