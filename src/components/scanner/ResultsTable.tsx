import React from 'react';
import { TrendingUp, CheckSquare, Square, Activity, Shield, Waves, Target, TrendingDown } from 'lucide-react';
import { ScanResult } from '../../types';
import ScoreGauge from '../ScoreGauge';
import DirectionPill from '../DirectionPill';

interface ResultsTableProps {
  results: ScanResult[];
  selectedSymbols: Set<string>;
  onToggleSelection: (symbol: string) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ 
  results, 
  selectedSymbols,
  onToggleSelection 
}) => {
  // Helper to extract score
  const getScore = (result: ScanResult): number => {
    return result.overall_score ?? result.final_score ?? result.score ?? 0;
  };

  // Helper to extract direction
  const getDirection = (result: ScanResult): 'BULLISH' | 'BEARISH' | 'NEUTRAL' => {
    return result.overall_direction ?? result.direction ?? 'NEUTRAL';
  };

  // Helper to extract component score
  const getComponentScore = (result: ScanResult, component: string): number => {
    if (result.sample_components && result.sample_components[component]) {
      return result.sample_components[component].score ?? 0;
    }
    return 0;
  };

  // Helper to extract risk level
  const getRiskLevel = (result: ScanResult): number => {
    if (typeof result.risk_level === 'number') {
      return result.risk_level;
    }
    // Convert string risk levels to numbers
    if (typeof result.risk_level === 'string') {
      const level = result.risk_level.toUpperCase();
      if (level === 'LOW') return 25;
      if (level === 'MEDIUM') return 50;
      if (level === 'HIGH') return 75;
    }
    return 50; // Default to medium risk
  };

  // Helper to extract price
  const getPrice = (result: ScanResult): number => {
    return result.price ?? 0;
  };

  // Format score as percentage
  const formatPercent = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-[1400px]">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-center py-4 px-2 text-slate-400 font-semibold text-xs">
              <Square className="w-4 h-4 mx-auto" />
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              رتبه
            </th>
            <th className="text-right py-4 px-4 text-slate-400 font-semibold text-sm">
              نماد / ارز
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              قیمت (USD)
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              موفقیت (%)
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              ریسک (%)
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              <div className="flex items-center justify-center gap-1">
                <Activity className="w-3 h-3" />
                <span>نهنگ‌ها</span>
              </div>
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              <div className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                <span>SMC</span>
              </div>
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              <div className="flex items-center justify-center gap-1">
                <Waves className="w-3 h-3" />
                <span>الیوت</span>
              </div>
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>پرایس اکشن</span>
              </div>
            </th>
            <th className="text-center py-4 px-3 text-slate-400 font-semibold text-xs">
              <div className="flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                <span>سطوح ICT</span>
              </div>
            </th>
            <th className="text-center py-4 px-4 text-slate-400 font-semibold text-sm">
              امتیاز نهایی (%)
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => {
            const score = getScore(result);
            const direction = getDirection(result);
            const price = getPrice(result);
            const riskLevel = getRiskLevel(result);
            const isSelected = selectedSymbols.has(result.symbol);

            // Extract component scores
            const whaleScore = getComponentScore(result, 'whales') || getComponentScore(result, 'whale_activity');
            const smcScore = getComponentScore(result, 'smc') || getComponentScore(result, 'smart_money');
            const elliottScore = getComponentScore(result, 'elliott') || getComponentScore(result, 'elliott_wave');
            const priceActionScore = getComponentScore(result, 'price_action');
            const ictScore = getComponentScore(result, 'ict') || getComponentScore(result, 'fibonacci');

            return (
              <tr
                key={`${result.symbol}-${index}`}
                className={`
                  border-b border-slate-800/50 transition-all duration-200 group
                  hover:bg-slate-700/30 cursor-pointer
                  ${isSelected ? 'bg-purple-500/10' : ''}
                `}
              >
                {/* Selection Checkbox */}
                <td className="py-3 px-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelection(result.symbol);
                    }}
                    className="p-1 hover:bg-slate-600/50 rounded transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                    )}
                  </button>
                </td>

                {/* Rank */}
                <td className="py-3 px-3">
                  <div className={`
                    text-center font-bold text-sm ltr-numbers
                    ${index < 3 ? 'text-yellow-400' : index < 10 ? 'text-cyan-400' : 'text-slate-400'}
                  `}>
                    #{index + 1}
                  </div>
                </td>

                {/* Symbol / Cryptocurrency */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-white text-base">
                      {result.symbol}
                    </div>
                    <DirectionPill direction={direction} size="xs" />
                  </div>
                </td>

                {/* Price (USD) */}
                <td className="py-3 px-3">
                  <div className="text-center font-mono text-sm text-white ltr-numbers">
                    ${price > 0 ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}
                  </div>
                </td>

                {/* Success (%) */}
                <td className="py-3 px-3">
                  <div className={`
                    text-center font-mono text-sm font-semibold ltr-numbers
                    ${score >= 0.7 ? 'text-emerald-400' : score >= 0.4 ? 'text-amber-400' : 'text-red-400'}
                  `}>
                    {formatPercent(score)}
                  </div>
                </td>

                {/* Risk (%) */}
                <td className="py-3 px-3">
                  <div className={`
                    text-center font-mono text-sm font-semibold ltr-numbers
                    ${riskLevel < 33 ? 'text-emerald-400' : riskLevel < 66 ? 'text-amber-400' : 'text-red-400'}
                  `}>
                    {riskLevel.toFixed(0)}%
                  </div>
                </td>

                {/* Whale Activity */}
                <td className="py-3 px-3">
                  <div className="flex justify-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ltr-numbers
                      ${whaleScore >= 0.7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        whaleScore >= 0.4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-700/30 text-slate-400 border border-slate-600/30'}
                    `}>
                      {(whaleScore * 100).toFixed(0)}
                    </div>
                  </div>
                </td>

                {/* Smart Money (SMC) */}
                <td className="py-3 px-3">
                  <div className="flex justify-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ltr-numbers
                      ${smcScore >= 0.7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        smcScore >= 0.4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-700/30 text-slate-400 border border-slate-600/30'}
                    `}>
                      {(smcScore * 100).toFixed(0)}
                    </div>
                  </div>
                </td>

                {/* Elliott Wave */}
                <td className="py-3 px-3">
                  <div className="flex justify-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ltr-numbers
                      ${elliottScore >= 0.7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        elliottScore >= 0.4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-700/30 text-slate-400 border border-slate-600/30'}
                    `}>
                      {(elliottScore * 100).toFixed(0)}
                    </div>
                  </div>
                </td>

                {/* Price Action */}
                <td className="py-3 px-3">
                  <div className="flex justify-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ltr-numbers
                      ${priceActionScore >= 0.7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        priceActionScore >= 0.4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-700/30 text-slate-400 border border-slate-600/30'}
                    `}>
                      {(priceActionScore * 100).toFixed(0)}
                    </div>
                  </div>
                </td>

                {/* ICT Key Levels */}
                <td className="py-3 px-3">
                  <div className="flex justify-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ltr-numbers
                      ${ictScore >= 0.7 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        ictScore >= 0.4 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-700/30 text-slate-400 border border-slate-600/30'}
                    `}>
                      {(ictScore * 100).toFixed(0)}
                    </div>
                  </div>
                </td>

                {/* Final Score (%) */}
                <td className="py-3 px-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`
                      text-lg font-bold ltr-numbers
                      ${score >= 0.7 ? 'text-emerald-400' : score >= 0.4 ? 'text-amber-400' : 'text-red-400'}
                    `}>
                      {formatPercent(score)}
                    </div>
                    <div 
                      className="h-1.5 rounded-full overflow-hidden bg-slate-700/50"
                      style={{ width: '80px' }}
                    >
                      <div
                        className={`h-full transition-all duration-700 ease-out ${
                          score < 0.3 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                          score < 0.7 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                          'bg-gradient-to-r from-emerald-500 to-emerald-600'
                        }`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
