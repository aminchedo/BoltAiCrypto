# backend/schemas/contracts.py - Pydantic models for API contracts

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict

class TimeframeScores(BaseModel):
    """Timeframe scores breakdown"""
    _15m: Optional[float] = Field(None, alias='15m')
    _1h: Optional[float] = Field(None, alias='1h')
    _4h: Optional[float] = Field(None, alias='4h')
    _1d: Optional[float] = Field(None, alias='1d')
    
    class Config:
        populate_by_name = True

class ScanItem(BaseModel):
    """Single scan result item"""
    rank: int
    symbol: str
    price: float
    success: float = Field(..., ge=0, le=1)
    risk: float = Field(..., ge=0, le=1)
    whales: float = Field(..., ge=0, le=1)
    smc: float = Field(..., ge=0, le=1)
    elliott: float = Field(..., ge=0, le=1)
    price_action: float = Field(..., ge=0, le=1)
    ict: float = Field(..., ge=0, le=1)
    final_score: float = Field(..., ge=0, le=1)
    direction: Literal['BULLISH', 'BEARISH', 'NEUTRAL']
    timeframes: Optional[Dict[str, float]] = None

class ScannerResponse(BaseModel):
    """Scanner API response"""
    results: List[ScanItem]
    meta: Optional[Dict[str, float]] = None

class ScoreResponse(BaseModel):
    """Signal score response"""
    direction: Literal['BULLISH', 'BEARISH', 'NEUTRAL']
    confidence: float = Field(..., ge=0, le=1)
    advice: Optional[str] = None

class AgentStatus(BaseModel):
    """Agent status"""
    enabled: bool
    scan_interval_ms: Optional[int] = None
    subscribed_symbols: Optional[List[str]] = None

class RiskStatus(BaseModel):
    """Risk metrics status"""
    var95: float
    leverage: float
    drawdown: float

class BacktestRequest(BaseModel):
    """Backtest request parameters"""
    symbol: str
    start_date: str
    end_date: str
    initial_capital: float = 10000
    fee: float = 0.0005
    slippage: float = 0.001

class BacktestMetrics(BaseModel):
    """Backtest performance metrics"""
    sharpe: float
    sortino: float
    max_drawdown: float
    win_rate: float
    total_trades: Optional[int] = None
    profit_factor: Optional[float] = None

class BacktestTrade(BaseModel):
    """Individual backtest trade"""
    entry_ts: int
    exit_ts: int
    profit: float
    side: Optional[Literal['LONG', 'SHORT']] = None

class BacktestResponse(BaseModel):
    """Backtest API response"""
    equity_series: List[Dict[str, float]]
    metrics: BacktestMetrics
    trades: List[BacktestTrade]

class WeightPreset(BaseModel):
    """Weight preset configuration"""
    name: str
    weights: Dict[str, float]

class WeightPresetsResponse(BaseModel):
    """Weight presets list response"""
    presets: List[WeightPreset]

class SignalMessage(BaseModel):
    """WebSocket signal message"""
    type: Literal['signal'] = 'signal'
    symbol: str
    direction: Literal['BULLISH', 'BEARISH', 'NEUTRAL']
    confidence: float
    score: float
    risk_level: Literal['LOW', 'MEDIUM', 'HIGH']
    timeframes: Optional[Dict[str, float]] = None
    ts: int

class StatusMessage(BaseModel):
    """WebSocket status message"""
    type: Literal['status'] = 'status'
    ws: Dict[str, int]

class ErrorMessage(BaseModel):
    """WebSocket error message"""
    type: Literal['error'] = 'error'
    message: str

class PongMessage(BaseModel):
    """WebSocket pong message"""
    type: Literal['pong'] = 'pong'
