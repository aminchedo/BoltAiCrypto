// src/types/contracts.ts - Shared contract types for API communication

export type TimeframeScores = { 
  '15m'?: number; 
  '1h'?: number; 
  '4h'?: number; 
  '1d'?: number 
};

export type ScanItem = {
  rank: number;
  symbol: string;
  price: number;
  success: number;     // 0..1
  risk: number;        // 0..1
  whales: number;      // 0..1
  smc: number;         // 0..1
  elliott: number;     // 0..1
  price_action: number;// 0..1
  ict: number;         // 0..1
  final_score: number; // 0..1
  direction: 'BULLISH'|'BEARISH'|'NEUTRAL';
  timeframes?: TimeframeScores;
};

export type ScannerResponse = { 
  results: ScanItem[]; 
  meta?: { consensus?: number } 
};

export type ScoreResponse = { 
  direction: 'BULLISH'|'BEARISH'|'NEUTRAL'; 
  confidence: number; 
  advice?: string 
};

export type AgentStatus = { 
  enabled: boolean;
  scan_interval_ms?: number;
  subscribed_symbols?: string[];
};

export type RiskStatus = { 
  var95: number; 
  leverage: number; 
  drawdown: number 
};

export type WebSocketMessage = 
  | SignalMessage
  | StatusMessage
  | ErrorMessage
  | PongMessage;

export type SignalMessage = {
  type: 'signal';
  symbol: string;
  direction: 'BULLISH'|'BEARISH'|'NEUTRAL';
  confidence: number;
  score: number;
  risk_level: 'LOW'|'MEDIUM'|'HIGH';
  timeframes?: TimeframeScores;
  ts: number;
};

export type StatusMessage = {
  type: 'status';
  ws: {
    connections: number;
    uptime: number;
  };
};

export type ErrorMessage = {
  type: 'error';
  message: string;
};

export type PongMessage = {
  type: 'pong';
};

export type BacktestRequest = {
  symbol: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  fee: number;
  slippage: number;
};

export type BacktestResponse = {
  equity_series: Array<{ ts: number; equity: number }>;
  metrics: {
    sharpe: number;
    sortino: number;
    max_drawdown: number;
    win_rate: number;
    total_trades?: number;
    profit_factor?: number;
  };
  trades: Array<{
    entry_ts: number;
    exit_ts: number;
    profit: number;
    side?: 'LONG'|'SHORT';
  }>;
};

export type WeightPreset = {
  name: string;
  weights: Record<string, number>;
};

export type WeightPresetsResponse = WeightPreset[];
