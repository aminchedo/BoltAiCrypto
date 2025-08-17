export interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  final_score: number;
  rsi_macd_score: number;
  smc_score: number;
  pattern_score: number;
  sentiment_score: number;
  ml_score: number;
  timestamp: Date;
  price: number;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  position_size?: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  timestamp: Date;
}

export interface OHLCVData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface RiskMetrics {
  current_equity: number;
  daily_loss_pct: number;
  consecutive_losses: number;
  daily_loss_limit_hit: boolean;
  consecutive_loss_limit_hit: boolean;
  position_size_multiplier: number;
  max_risk_per_trade: number;
}

export interface IndicatorData {
  rsi: number[];
  macd: {
    macd_line: number[];
    signal_line: number[];
    histogram: number[];
  };
  atr: number[];
  ema_20: number[];
  ema_50: number[];
}

export interface SMCAnalysis {
  score: number;
  order_blocks: {
    strength: number;
    level: number;
    type: 'bullish' | 'bearish';
  };
  liquidity_zones: {
    proximity: number;
    level: number;
    strength: number;
  };
  fair_value_gaps: {
    present: boolean;
    count: number;
    latest: any;
  };
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface PatternAnalysis {
  score: number;
  patterns: {
    doji: PatternResult;
    hammer: PatternResult;
    engulfing: PatternResult;
    pin_bar: PatternResult;
  };
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  strength: number;
}

export interface PatternResult {
  detected: boolean;
  strength: number;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface SentimentData {
  score: number;
  fear_greed: {
    value: number;
    classification: string;
    signal: string;
  };
  signal: string;
  timestamp: Date;
}

export interface MLPrediction {
  score: number;
  prediction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
}