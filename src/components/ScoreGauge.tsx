import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0-1 range
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ 
  score, 
  size = 'md',
  showLabel = true 
}) => {
  // Clamp score to 0-1
  const clampedScore = Math.max(0, Math.min(1, score));
  const percentage = clampedScore * 100;

  // Color mapping: 0-0.3=bearish(red), 0.3-0.7=neutral(yellow), 0.7-1=bullish(green)
  const getColor = (s: number) => {
    if (s < 0.3) return 'text-red-400 border-red-500/50 bg-red-500/20';
    if (s < 0.7) return 'text-amber-400 border-amber-500/50 bg-amber-500/20';
    return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/20';
  };

  const getGradient = (s: number) => {
    if (s < 0.3) return 'from-red-500 to-red-600';
    if (s < 0.7) return 'from-amber-500 to-amber-600';
    return 'from-emerald-500 to-emerald-600';
  };

  const sizeClasses = {
    sm: { container: 'w-16 h-16', text: 'text-xs', ring: 'w-14 h-14' },
    md: { container: 'w-20 h-20', text: 'text-sm', ring: 'w-18 h-18' },
    lg: { container: 'w-24 h-24', text: 'text-base', ring: 'w-22 h-22' }
  };

  const classes = sizeClasses[size];
  const colorClasses = getColor(clampedScore);
  const gradientClasses = getGradient(clampedScore);

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${classes.container}`}>
        {/* Background circle */}
        <div className={`absolute inset-0 rounded-full border-2 ${colorClasses}`}></div>
        
        {/* Progress arc (using conic gradient) */}
        <div 
          className={`absolute inset-0 rounded-full opacity-30`}
          style={{
            background: `conic-gradient(
              from 0deg,
              transparent ${100 - percentage}%,
              currentColor ${100 - percentage}%
            )`
          }}
        ></div>
        
        {/* Score text */}
        <div className={`absolute inset-0 flex items-center justify-center ${classes.text} font-bold ${colorClasses.split(' ')[0]}`}>
          {(clampedScore * 100).toFixed(0)}
        </div>
      </div>
      
      {showLabel && (
        <div className={`mt-2 ${classes.text} font-medium ${colorClasses.split(' ')[0]}`}>
          امتیاز
        </div>
      )}
    </div>
  );
};

export default ScoreGauge;
