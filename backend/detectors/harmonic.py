"""
Harmonic Pattern Detection Module
Phase 3.1: Advanced Pattern Detectors

Detects Butterfly, Bat, Gartley, and Crab harmonic patterns using Fibonacci ratios.
"""

from dataclasses import dataclass
from typing import List, Optional, Tuple, Dict, Any
import numpy as np
from scipy.signal import argrelextrema
import logging

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class HarmonicPattern:
    """Validated harmonic pattern"""
    name: str  # "Butterfly", "Bat", "Gartley", "Crab"
    points: dict  # X, A, B, C, D coordinates
    ratios: dict  # Actual ratios vs ideal
    quality_score: float  # How well ratios match ideal
    is_bullish: bool
    completion_level: float  # % completion of pattern
    projected_targets: List[float]

@dataclass
class DetectionResult:
    """Standard detection result format"""
    score: float
    confidence: float
    direction: str  # "BULLISH", "BEARISH", "NEUTRAL"
    meta: Dict[str, Any]

class ZigZagExtractor:
    """Extract swing highs/lows for pattern recognition"""
    
    def __init__(self, threshold_pct: float = 5.0):
        self.threshold_pct = threshold_pct
    
    def extract_pivots(self, ohlcv: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extract significant swing points using ZigZag logic
        
        Args:
            ohlcv: List of OHLCV bars with 'high', 'low', 'open', 'close', 'volume' keys
        
        Returns:
            List of pivots: [{"index": int, "price": float, "type": "HIGH"|"LOW"}, ...]
        """
        try:
            highs = np.array([bar['high'] for bar in ohlcv])
            lows = np.array([bar['low'] for bar in ohlcv])
            
            # Find local extrema with order=5 (5 bars on each side)
            high_indices = argrelextrema(highs, np.greater, order=5)[0]
            low_indices = argrelextrema(lows, np.less, order=5)[0]
            
            pivots = []
            for idx in high_indices:
                pivots.append({"index": int(idx), "price": float(highs[idx]), "type": "HIGH"})
            for idx in low_indices:
                pivots.append({"index": int(idx), "price": float(lows[idx]), "type": "LOW"})
            
            # Sort by index
            pivots.sort(key=lambda p: p['index'])
            
            # Filter by threshold - only keep significant swings
            filtered = [pivots[0]] if pivots else []
            for i in range(1, len(pivots)):
                prev_price = filtered[-1]['price']
                curr_price = pivots[i]['price']
                pct_change = abs((curr_price - prev_price) / prev_price * 100)
                
                if pct_change >= self.threshold_pct:
                    filtered.append(pivots[i])
            
            logger.debug(f"Extracted {len(filtered)} pivots from {len(ohlcv)} bars")
            return filtered
            
        except Exception as e:
            logger.error(f"Error extracting pivots: {e}")
            return []

class HarmonicDetector:
    """Detect Butterfly, Bat, Gartley, Crab patterns"""
    
    PATTERNS = {
        "Butterfly": {
            "XA_AB": (0.786, 0.02),  # AB = 0.786 of XA ± 2%
            "AB_BC": (0.382, 0.886, 0.04),  # BC between 0.382-0.886 of AB
            "BC_CD": (1.618, 2.618, 0.1),  # CD between 1.618-2.618 of BC
            "XA_AD": (1.27, 1.618, 0.05)  # AD extension
        },
        "Bat": {
            "XA_AB": (0.382, 0.5, 0.03),
            "AB_BC": (0.382, 0.886, 0.04),
            "BC_CD": (1.618, 2.618, 0.1),
            "XA_AD": (0.886, 0.03)
        },
        "Gartley": {
            "XA_AB": (0.618, 0.03),
            "AB_BC": (0.382, 0.886, 0.04),
            "BC_CD": (1.27, 1.618, 0.05),
            "XA_AD": (0.786, 0.03)
        },
        "Crab": {
            "XA_AB": (0.382, 0.618, 0.04),
            "AB_BC": (0.382, 0.886, 0.04),
            "BC_CD": (2.618, 3.618, 0.15),
            "XA_AD": (1.618, 0.05)
        }
    }
    
    def __init__(self):
        self.zigzag = ZigZagExtractor(threshold_pct=3.0)
    
    async def detect(self, ohlcv: List[Dict[str, Any]], context: Dict[str, Any] = None) -> DetectionResult:
        """
        Detect harmonic patterns and return signed score
        
        Args:
            ohlcv: List of OHLCV bars
            context: Additional context (RSI, trend, etc.)
        
        Returns:
            DetectionResult with score [-1, +1] and pattern details
        """
        if context is None:
            context = {}
            
        try:
            if len(ohlcv) < 100:
                return DetectionResult(
                    score=0.0,
                    confidence=0.0,
                    direction="NEUTRAL",
                    meta={"error": "Insufficient data"}
                )
            
            pivots = self.zigzag.extract_pivots(ohlcv)
            
            if len(pivots) < 5:
                return DetectionResult(
                    score=0.0,
                    confidence=0.0,
                    direction="NEUTRAL",
                    meta={"pivots_found": len(pivots)}
                )
            
            # Scan for patterns in last 5 pivots
            best_pattern = None
            best_score = 0.0
            
            for i in range(len(pivots) - 4):
                X, A, B, C, D = pivots[i:i+5]
                
                # Check alternation (must go high-low-high-low or vice versa)
                if not self._validate_alternation([X, A, B, C, D]):
                    continue
                
                for pattern_name, ratios in self.PATTERNS.items():
                    pattern = self._validate_pattern(X, A, B, C, D, pattern_name, ratios)
                    
                    if pattern and pattern.quality_score > best_score:
                        best_pattern = pattern
                        best_score = pattern.quality_score
            
            if not best_pattern:
                return DetectionResult(
                    score=0.0,
                    confidence=0.0,
                    direction="NEUTRAL",
                    meta={"patterns_scanned": len(pivots) - 4}
                )
            
            # Calculate final score with confluence
            confluence_score = self._calculate_confluence(best_pattern, ohlcv, context)
            
            # Combine quality + confluence
            final_score = best_pattern.quality_score * 0.6 + confluence_score * 0.4
            
            # Apply sign based on direction
            if not best_pattern.is_bullish:
                final_score = -final_score
            
            direction = "BULLISH" if best_pattern.is_bullish else "BEARISH"
            
            return DetectionResult(
                score=float(np.clip(final_score, -1.0, 1.0)),
                confidence=best_pattern.quality_score,
                direction=direction,
                meta={
                    "pattern": best_pattern.name,
                    "points": best_pattern.points,
                    "ratios": best_pattern.ratios,
                    "completion": best_pattern.completion_level,
                    "targets": best_pattern.projected_targets
                }
            )
            
        except Exception as e:
            logger.error(f"Error in harmonic pattern detection: {e}")
            return DetectionResult(
                score=0.0,
                confidence=0.0,
                direction="NEUTRAL",
                meta={"error": str(e)}
            )
    
    def _validate_alternation(self, points: List[Dict[str, Any]]) -> bool:
        """Ensure points alternate between highs and lows"""
        try:
            types = [p['type'] for p in points]
            for i in range(len(types) - 1):
                if types[i] == types[i+1]:
                    return False
            return True
        except Exception as e:
            logger.error(f"Error validating alternation: {e}")
            return False
    
    def _validate_pattern(
        self,
        X: Dict[str, Any], A: Dict[str, Any], B: Dict[str, Any], C: Dict[str, Any], D: Dict[str, Any],
        pattern_name: str,
        ratio_rules: Dict[str, Tuple]
    ) -> Optional[HarmonicPattern]:
        """Check if XABCD forms valid harmonic pattern"""
        
        try:
            # Calculate actual ratios
            XA = abs(A['price'] - X['price'])
            AB = abs(B['price'] - A['price'])
            BC = abs(C['price'] - B['price'])
            CD = abs(D['price'] - C['price'])
            AD = abs(D['price'] - A['price'])
            
            if XA == 0:
                return None
            
            actual_ratios = {
                "XA_AB": AB / XA,
                "AB_BC": BC / AB if AB > 0 else 0,
                "BC_CD": CD / BC if BC > 0 else 0,
                "XA_AD": AD / XA
            }
            
            # Check if ratios match pattern rules
            quality_scores = []
            
            for ratio_name, rule in ratio_rules.items():
                actual = actual_ratios.get(ratio_name, 0)
                
                if len(rule) == 2:  # (ideal, tolerance)
                    ideal, tolerance = rule
                    diff = abs(actual - ideal) / ideal
                    if diff <= tolerance:
                        quality_scores.append(1.0 - (diff / tolerance))
                    else:
                        return None  # Pattern invalid
                
                elif len(rule) == 3:  # (min, max, tolerance)
                    min_val, max_val, tolerance = rule
                    if min_val <= actual <= max_val:
                        # Score based on how centered in range
                        center = (min_val + max_val) / 2
                        distance = abs(actual - center) / (max_val - min_val)
                        quality_scores.append(1.0 - distance)
                    else:
                        return None
            
            if not quality_scores:
                return None
            
            # Overall quality
            quality = float(np.mean(quality_scores))
            
            # Determine direction
            is_bullish = (A['type'] == 'HIGH' and D['price'] < A['price'])
            
            # Calculate targets (Fibonacci projections from D)
            targets = self._calculate_targets(X, A, B, C, D, is_bullish)
            
            # Completion level (how close is current price to D)
            completion = min(1.0, CD / (CD + 0.0001))
            
            return HarmonicPattern(
                name=pattern_name,
                points={
                    "X": {"index": X['index'], "price": X['price']},
                    "A": {"index": A['index'], "price": A['price']},
                    "B": {"index": B['index'], "price": B['price']},
                    "C": {"index": C['index'], "price": C['price']},
                    "D": {"index": D['index'], "price": D['price']}
                },
                ratios=actual_ratios,
                quality_score=quality,
                is_bullish=is_bullish,
                completion_level=completion,
                projected_targets=targets
            )
            
        except Exception as e:
            logger.error(f"Error validating pattern {pattern_name}: {e}")
            return None
    
    def _calculate_targets(
        self,
        X: Dict[str, Any], A: Dict[str, Any], B: Dict[str, Any], C: Dict[str, Any], D: Dict[str, Any],
        is_bullish: bool
    ) -> List[float]:
        """Calculate Fibonacci target levels from D"""
        try:
            XA = abs(A['price'] - X['price'])
            
            targets = []
            fib_levels = [0.382, 0.618, 1.0, 1.618]
            
            for level in fib_levels:
                if is_bullish:
                    target = D['price'] + (XA * level)
                else:
                    target = D['price'] - (XA * level)
                targets.append(float(target))
            
            return targets
        except Exception as e:
            logger.error(f"Error calculating targets: {e}")
            return []
    
    def _calculate_confluence(
        self,
        pattern: HarmonicPattern,
        ohlcv: List[Dict[str, Any]],
        context: Dict[str, Any]
    ) -> float:
        """Check if pattern aligns with other signals"""
        try:
            confluence = 0.5  # Neutral baseline
            
            current_price = ohlcv[-1]['close']
            D_price = pattern.points['D']['price']
            
            # Check if price near completion point
            distance_to_D = abs(current_price - D_price) / D_price
            if distance_to_D < 0.02:  # Within 2%
                confluence += 0.2
            
            # Check RSI confluence
            if 'rsi' in context:
                rsi = context['rsi']
                if pattern.is_bullish and rsi < 30:
                    confluence += 0.15
                elif not pattern.is_bullish and rsi > 70:
                    confluence += 0.15
            
            # Check trend alignment
            if context.get('trend') == 'up' and pattern.is_bullish:
                confluence += 0.1
            elif context.get('trend') == 'down' and not pattern.is_bullish:
                confluence += 0.1
            
            return float(np.clip(confluence, 0.0, 1.0))
            
        except Exception as e:
            logger.error(f"Error calculating confluence: {e}")
            return 0.5
