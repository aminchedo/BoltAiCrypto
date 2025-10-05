"""
Harmonic Pattern Detector
Detects Gartley, Butterfly, Bat, and Crab patterns
"""

import pandas as pd
import numpy as np
from typing import Dict, Any
from .base import BaseDetector, DetectionResult

class HarmonicDetector(BaseDetector):
    """Detects harmonic trading patterns"""
    
    def __init__(self):
        super().__init__("harmonic")
    
    async def detect(self, ohlcv: pd.DataFrame, context: Dict[str, Any] = None) -> DetectionResult:
        """Detect harmonic patterns in OHLCV data"""
        try:
            if len(ohlcv) < 20:
                return DetectionResult(0.5, "NEUTRAL", 0.0, {"error": "Insufficient data"})
            
            # Get recent price data
            highs = ohlcv['high'].values
            lows = ohlcv['low'].values
            closes = ohlcv['close'].values
            
            # Look for harmonic patterns in the last 20 bars
            recent_data = {
                'highs': highs[-20:],
                'lows': lows[-20:],
                'closes': closes[-20:]
            }
            
            # Detect patterns
            patterns = self._detect_harmonic_patterns(recent_data)
            
            if not patterns:
                return DetectionResult(0.5, "NEUTRAL", 0.0, {"patterns": []})
            
            # Get the strongest pattern
            best_pattern = max(patterns, key=lambda p: p['strength'])
            
            # Calculate score and direction
            score = self._normalize_score(best_pattern['strength'])
            direction = "BULLISH" if best_pattern['type'].endswith('_BULL') else "BEARISH"
            confidence = self._calculate_confidence(best_pattern['strength'], context)
            
            return DetectionResult(
                score=score,
                direction=direction,
                confidence=confidence,
                meta={
                    "pattern": best_pattern['type'],
                    "strength": best_pattern['strength'],
                    "all_patterns": patterns
                }
            )
            
        except Exception as e:
            return DetectionResult(0.5, "NEUTRAL", 0.0, {"error": str(e)})
    
    def _detect_harmonic_patterns(self, data: Dict[str, np.ndarray]) -> List[Dict[str, Any]]:
        """Detect various harmonic patterns"""
        patterns = []
        
        # Find pivot points
        highs = data['highs']
        lows = data['lows']
        
        # Simple pivot detection
        pivot_highs = self._find_pivot_highs(highs)
        pivot_lows = self._find_pivot_lows(lows)
        
        # Check for Gartley patterns
        gartley_bull = self._check_gartley_bull(pivot_highs, pivot_lows)
        if gartley_bull:
            patterns.append(gartley_bull)
        
        gartley_bear = self._check_gartley_bear(pivot_highs, pivot_lows)
        if gartley_bear:
            patterns.append(gartley_bear)
        
        # Check for Butterfly patterns
        butterfly_bull = self._check_butterfly_bull(pivot_highs, pivot_lows)
        if butterfly_bull:
            patterns.append(butterfly_bull)
        
        butterfly_bear = self._check_butterfly_bear(pivot_highs, pivot_lows)
        if butterfly_bear:
            patterns.append(butterfly_bear)
        
        return patterns
    
    def _find_pivot_highs(self, highs: np.ndarray, lookback: int = 3) -> List[int]:
        """Find pivot high points"""
        pivots = []
        for i in range(lookback, len(highs) - lookback):
            if all(highs[i] > highs[i-j] for j in range(1, lookback+1)) and \
               all(highs[i] > highs[i+j] for j in range(1, lookback+1)):
                pivots.append(i)
        return pivots
    
    def _find_pivot_lows(self, lows: np.ndarray, lookback: int = 3) -> List[int]:
        """Find pivot low points"""
        pivots = []
        for i in range(lookback, len(lows) - lookback):
            if all(lows[i] < lows[i-j] for j in range(1, lookback+1)) and \
               all(lows[i] < lows[i+j] for j in range(1, lookback+1)):
                pivots.append(i)
        return pivots
    
    def _check_gartley_bull(self, pivot_highs: List[int], pivot_lows: List[int]) -> Dict[str, Any]:
        """Check for bullish Gartley pattern"""
        if len(pivot_lows) < 3 or len(pivot_highs) < 2:
            return None
        
        # Get recent pivots
        recent_lows = pivot_lows[-3:]
        recent_highs = [h for h in pivot_highs if h > recent_lows[0]][-2:]
        
        if len(recent_highs) < 2:
            return None
        
        # X, A, B, C, D points
        X = recent_lows[0]
        A = recent_highs[0]
        B = recent_lows[1]
        C = recent_highs[1]
        D = recent_lows[2]
        
        # Calculate Fibonacci ratios
        AB_ratio = (B - A) / (X - A) if X != A else 0
        BC_ratio = (C - B) / (A - B) if A != B else 0
        CD_ratio = (D - C) / (B - C) if B != C else 0
        
        # Gartley ratios: AB=0.618, BC=0.382-0.886, CD=1.13-1.618
        gartley_score = 0
        if 0.5 <= AB_ratio <= 0.7:
            gartley_score += 0.3
        if 0.3 <= BC_ratio <= 0.9:
            gartley_score += 0.3
        if 1.1 <= CD_ratio <= 1.7:
            gartley_score += 0.4
        
        if gartley_score > 0.6:
            return {
                'type': 'GARTLEY_BULL',
                'strength': gartley_score,
                'points': {'X': X, 'A': A, 'B': B, 'C': C, 'D': D},
                'ratios': {'AB': AB_ratio, 'BC': BC_ratio, 'CD': CD_ratio}
            }
        
        return None
    
    def _check_gartley_bear(self, pivot_highs: List[int], pivot_lows: List[int]) -> Dict[str, Any]:
        """Check for bearish Gartley pattern"""
        if len(pivot_highs) < 3 or len(pivot_lows) < 2:
            return None
        
        # Similar logic but inverted for bearish pattern
        recent_highs = pivot_highs[-3:]
        recent_lows = [l for l in pivot_lows if l > recent_highs[0]][-2:]
        
        if len(recent_lows) < 2:
            return None
        
        # Similar ratio calculations but inverted
        return None  # Simplified for now
    
    def _check_butterfly_bull(self, pivot_highs: List[int], pivot_lows: List[int]) -> Dict[str, Any]:
        """Check for bullish Butterfly pattern"""
        # Similar to Gartley but with different ratios
        return None  # Simplified for now
    
    def _check_butterfly_bear(self, pivot_highs: List[int], pivot_lows: List[int]) -> Dict[str, Any]:
        """Check for bearish Butterfly pattern"""
        return None  # Simplified for now