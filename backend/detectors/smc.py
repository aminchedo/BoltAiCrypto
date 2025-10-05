"""
Smart Money Concepts (SMC) Detection Module
Phase 3.3: Advanced Pattern Detectors

Detects Smart Money Concepts including BOS, CHOCH, Order Blocks, and Fair Value Gaps.
"""

from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import numpy as np
import logging
from .harmonic import DetectionResult

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class OrderBlock:
    """Identified order block zone"""
    start_idx: int
    end_idx: int
    high: float
    low: float
    is_bullish: bool
    strength: float  # Based on volume and reaction

@dataclass
class FVG:
    """Fair Value Gap"""
    start_idx: int
    gap_high: float
    gap_low: float
    is_bullish: bool

class SMCDetector:
    """Smart Money Concepts - BOS, CHOCH, Order Blocks, FVG"""
    
    async def detect(self, ohlcv: List[Dict[str, Any]], context: Dict[str, Any] = None) -> DetectionResult:
        """
        Detect SMC structures
        
        Priority signals:
        1. Break of Structure (BOS) - strong continuation
        2. Change of Character (CHOCH) - potential reversal
        3. Order Blocks - institutional zones
        4. Fair Value Gaps - imbalance zones
        
        Args:
            ohlcv: List of OHLCV bars
            context: Additional context (volume, trend, etc.)
        
        Returns:
            DetectionResult with score [-1, +1] and SMC details
        """
        if context is None:
            context = {}
            
        try:
            if len(ohlcv) < 50:
                return DetectionResult(
                    score=0.0,
                    confidence=0.0,
                    direction="NEUTRAL",
                    meta={"error": "Insufficient data"}
                )
            
            # Detect structures
            bos = self._detect_bos(ohlcv)
            choch = self._detect_choch(ohlcv)
            order_blocks = self._detect_order_blocks(ohlcv)
            fvgs = self._detect_fvg(ohlcv)
            
            # Calculate proximity scores
            current_price = ohlcv[-1]['close']
            
            ob_score = self._score_order_block_proximity(order_blocks, current_price)
            fvg_score = self._score_fvg_proximity(fvgs, current_price)
            
            # Combine signals
            structure_score = 0.0
            confidence = 0.5
            
            if bos:
                structure_score += 0.7 if bos['is_bullish'] else -0.7
                confidence += 0.2
            
            if choch:
                structure_score += 0.5 if choch['is_bullish'] else -0.5
                confidence += 0.15
            
            # Weight by proximity to key zones
            final_score = (structure_score * 0.5 + ob_score * 0.3 + fvg_score * 0.2)
            
            direction = "BULLISH" if final_score > 0 else "BEARISH" if final_score < 0 else "NEUTRAL"
            
            return DetectionResult(
                score=float(np.clip(final_score, -1.0, 1.0)),
                confidence=float(np.clip(confidence, 0.0, 1.0)),
                direction=direction,
                meta={
                    "bos": bos is not None,
                    "choch": choch is not None,
                    "order_blocks_count": len(order_blocks),
                    "fvg_count": len(fvgs),
                    "nearest_ob": self._get_nearest_ob(order_blocks, current_price) if order_blocks else None,
                    "bos_details": bos,
                    "choch_details": choch
                }
            )
            
        except Exception as e:
            logger.error(f"Error in SMC detection: {e}")
            return DetectionResult(
                score=0.0,
                confidence=0.0,
                direction="NEUTRAL",
                meta={"error": str(e)}
            )
    
    def _detect_bos(self, ohlcv: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Detect Break of Structure - price breaks previous high/low with momentum"""
        try:
            lookback = min(20, len(ohlcv) - 1)
            
            highs = [bar['high'] for bar in ohlcv[-lookback:]]
            lows = [bar['low'] for bar in ohlcv[-lookback:]]
            
            recent_high = max(highs[:-3])
            recent_low = min(lows[:-3])
            
            current_close = ohlcv[-1]['close']
            prev_close = ohlcv[-2]['close']
            
            # Bullish BOS
            if current_close > recent_high and prev_close <= recent_high:
                return {
                    "is_bullish": True,
                    "break_level": recent_high,
                    "strength": (current_close - recent_high) / recent_high,
                    "type": "BOS"
                }
            
            # Bearish BOS
            if current_close < recent_low and prev_close >= recent_low:
                return {
                    "is_bullish": False,
                    "break_level": recent_low,
                    "strength": (recent_low - current_close) / recent_low,
                    "type": "BOS"
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting BOS: {e}")
            return None
    
    def _detect_choch(self, ohlcv: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Detect Change of Character - trend exhaustion signal"""
        try:
            if len(ohlcv) < 30:
                return None
            
            # Look for failure to make new high/low
            lookback = 15
            
            highs = [bar['high'] for bar in ohlcv[-lookback:]]
            lows = [bar['low'] for bar in ohlcv[-lookback:]]
            
            # Check if recent bars failed to break previous extreme
            prev_high = max(highs[:-5])
            recent_high = max(highs[-5:])
            
            prev_low = min(lows[:-5])
            recent_low = min(lows[-5:])
            
            # Bullish CHOCH - failed to make new low
            if recent_low > prev_low:
                return {
                    "is_bullish": True, 
                    "type": "CHOCH",
                    "strength": (recent_low - prev_low) / prev_low
                }
            
            # Bearish CHOCH - failed to make new high
            if recent_high < prev_high:
                return {
                    "is_bullish": False, 
                    "type": "CHOCH",
                    "strength": (prev_high - recent_high) / prev_high
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error detecting CHOCH: {e}")
            return None
    
    def _detect_order_blocks(self, ohlcv: List[Dict[str, Any]]) -> List[OrderBlock]:
        """
        Detect Order Blocks - last down/up candle before strong move
        """
        try:
            order_blocks = []
            lookback = min(50, len(ohlcv))
            
            for i in range(lookback - 3, 0, -1):
                curr = ohlcv[i]
                next1 = ohlcv[i + 1]
                next2 = ohlcv[i + 2]
                
                # Bullish OB: down candle followed by strong up move
                if (curr['close'] < curr['open'] and  # Down candle
                    next1['close'] > next1['open'] and  # Up candle
                    next1['close'] > curr['high']):  # Breaks high
                    
                    move_size = (next1['close'] - next1['open']) / next1['open']
                    if move_size > 0.02:  # At least 2% move
                        order_blocks.append(OrderBlock(
                            start_idx=i,
                            end_idx=i,
                            high=curr['high'],
                            low=curr['low'],
                            is_bullish=True,
                            strength=move_size
                        ))
                
                # Bearish OB: up candle followed by strong down move
                elif (curr['close'] > curr['open'] and
                      next1['close'] < next1['open'] and
                      next1['close'] < curr['low']):
                    
                    move_size = (next1['open'] - next1['close']) / next1['open']
                    if move_size > 0.02:
                        order_blocks.append(OrderBlock(
                            start_idx=i,
                            end_idx=i,
                            high=curr['high'],
                            low=curr['low'],
                            is_bullish=False,
                            strength=move_size
                        ))
            
            # Keep only strongest OBs
            order_blocks.sort(key=lambda ob: ob.strength, reverse=True)
            return order_blocks[:5]
            
        except Exception as e:
            logger.error(f"Error detecting order blocks: {e}")
            return []
    
    def _detect_fvg(self, ohlcv: List[Dict[str, Any]]) -> List[FVG]:
        """
        Detect Fair Value Gaps - 3-candle imbalance
        """
        try:
            fvgs = []
            
            for i in range(len(ohlcv) - 3):
                candle1 = ohlcv[i]
                candle2 = ohlcv[i + 1]
                candle3 = ohlcv[i + 2]
                
                # Bullish FVG: gap between candle1 high and candle3 low
                if candle3['low'] > candle1['high']:
                    gap_size = (candle3['low'] - candle1['high']) / candle1['high']
                    if gap_size > 0.005:  # At least 0.5% gap
                        fvgs.append(FVG(
                            start_idx=i,
                            gap_high=candle3['low'],
                            gap_low=candle1['high'],
                            is_bullish=True
                        ))
                
                # Bearish FVG: gap between candle1 low and candle3 high
                elif candle3['high'] < candle1['low']:
                    gap_size = (candle1['low'] - candle3['high']) / candle3['high']
                    if gap_size > 0.005:
                        fvgs.append(FVG(
                            start_idx=i,
                            gap_high=candle1['low'],
                            gap_low=candle3['high'],
                            is_bullish=False
                        ))
            
            # Keep recent FVGs only
            return fvgs[-10:]
            
        except Exception as e:
            logger.error(f"Error detecting FVG: {e}")
            return []
    
    def _score_order_block_proximity(self, order_blocks: List[OrderBlock], current_price: float) -> float:
        """Score based on proximity to order blocks"""
        try:
            if not order_blocks:
                return 0.0
            
            nearest = min(
                order_blocks,
                key=lambda ob: min(
                    abs(current_price - ob.high),
                    abs(current_price - ob.low)
                )
            )
            
            distance = min(
                abs(current_price - nearest.high),
                abs(current_price - nearest.low)
            ) / current_price
            
            # Within 1% of OB
            if distance < 0.01:
                return 0.7 if nearest.is_bullish else -0.7
            elif distance < 0.03:
                return 0.4 if nearest.is_bullish else -0.4
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error scoring order block proximity: {e}")
            return 0.0
    
    def _score_fvg_proximity(self, fvgs: List[FVG], current_price: float) -> float:
        """Score based on FVG proximity"""
        try:
            if not fvgs:
                return 0.0
            
            for fvg in fvgs:
                # Price inside FVG
                if fvg.gap_low <= current_price <= fvg.gap_high:
                    return 0.5 if fvg.is_bullish else -0.5
            
            return 0.0
            
        except Exception as e:
            logger.error(f"Error scoring FVG proximity: {e}")
            return 0.0
    
    def _get_nearest_ob(self, order_blocks: List[OrderBlock], current_price: float) -> Optional[Dict[str, Any]]:
        """Get nearest order block details"""
        try:
            if not order_blocks:
                return None
            
            nearest = min(
                order_blocks,
                key=lambda ob: min(abs(current_price - ob.high), abs(current_price - ob.low))
            )
            
            return {
                "high": nearest.high,
                "low": nearest.low,
                "is_bullish": nearest.is_bullish,
                "distance_pct": min(
                    abs(current_price - nearest.high),
                    abs(current_price - nearest.low)
                ) / current_price * 100
            }
            
        except Exception as e:
            logger.error(f"Error getting nearest order block: {e}")
            return None
