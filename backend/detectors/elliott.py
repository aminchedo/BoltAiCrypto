"""
Elliott Wave Detection Module
Phase 3.2: Advanced Pattern Detectors

Detects Elliott Wave patterns and wave counting for market structure analysis.
"""

from enum import Enum
from dataclasses import dataclass
from typing import List, Optional, Tuple, Dict, Any
import numpy as np
import logging
from .harmonic import ZigZagExtractor, DetectionResult

# Configure logging
logger = logging.getLogger(__name__)

class WaveType(Enum):
    IMPULSE = "impulse"
    CORRECTIVE = "corrective"

@dataclass
class WaveCount:
    """Elliott wave labeling"""
    waves: List[Dict[str, Any]]  # [{label: "1", start_idx, end_idx, price_start, price_end}, ...]
    degree: str  # "minor", "intermediate", "primary"
    confidence: float
    current_wave: str
    forecast: Dict[str, Any]

class ElliottWaveDetector:
    """Simplified Elliott Wave heuristic detector"""
    
    def __init__(self):
        self.zigzag = ZigZagExtractor(threshold_pct=4.0)
    
    async def detect(self, ohlcv: List[Dict[str, Any]], context: Dict[str, Any] = None) -> DetectionResult:
        """
        Detect Elliott Wave patterns
        
        Focus on Wave 3 (strongest) and Wave 5 (final impulse) detection
        
        Args:
            ohlcv: List of OHLCV bars
            context: Additional context (RSI, trend, etc.)
        
        Returns:
            DetectionResult with score [-1, +1] and wave details
        """
        if context is None:
            context = {}
            
        try:
            if len(ohlcv) < 150:
                return DetectionResult(
                    score=0.0,
                    confidence=0.0,
                    direction="NEUTRAL",
                    meta={"error": "Insufficient data for wave analysis"}
                )
            
            pivots = self.zigzag.extract_pivots(ohlcv)
            
            if len(pivots) < 8:  # Need at least 8 pivots for 5-wave structure
                return DetectionResult(
                    score=0.0,
                    confidence=0.0,
                    direction="NEUTRAL",
                    meta={"pivots": len(pivots)}
                )
            
            # Scan for 5-wave impulse structures
            best_wave = None
            best_confidence = 0.0
            
            for i in range(len(pivots) - 7):
                wave_structure = pivots[i:i+8]
                
                wave_count = self._identify_impulse_wave(wave_structure)
                
                if wave_count and wave_count.confidence > best_confidence:
                    best_wave = wave_count
                    best_confidence = wave_count.confidence
            
            if not best_wave:
                return DetectionResult(
                    score=0.0,
                    confidence=0.0,
                    direction="NEUTRAL",
                    meta={"no_clear_wave_structure": True}
                )
            
            # Calculate score based on current wave position
            score = self._calculate_wave_score(best_wave, ohlcv)
            
            direction = "BULLISH" if score > 0 else "BEARISH" if score < 0 else "NEUTRAL"
            
            return DetectionResult(
                score=float(np.clip(score, -1.0, 1.0)),
                confidence=best_wave.confidence,
                direction=direction,
                meta={
                    "wave_count": best_wave.waves,
                    "current_wave": best_wave.current_wave,
                    "degree": best_wave.degree,
                    "forecast": best_wave.forecast
                }
            )
            
        except Exception as e:
            logger.error(f"Error in Elliott Wave detection: {e}")
            return DetectionResult(
                score=0.0,
                confidence=0.0,
                direction="NEUTRAL",
                meta={"error": str(e)}
            )
    
    def _identify_impulse_wave(self, pivots: List[Dict[str, Any]]) -> Optional[WaveCount]:
        """
        Identify 5-wave impulse pattern from pivots
        
        Args:
            pivots: List of 8 pivots (5 waves + 3 for context)
        
        Returns:
            WaveCount if valid pattern found, None otherwise
        """
        try:
            if len(pivots) < 8:
                return None
            
            # Extract 5-wave structure (pivots 1-6)
            wave_pivots = pivots[1:7]  # Skip first and last for context
            
            # Check if we have alternating highs and lows
            if not self._validate_wave_alternation(wave_pivots):
                return None
            
            # Calculate wave ratios
            waves = self._calculate_wave_ratios(wave_pivots)
            
            if not waves:
                return None
            
            # Validate Elliott Wave rules
            if not self._validate_elliott_rules(waves):
                return None
            
            # Calculate confidence based on rule adherence
            confidence = self._calculate_wave_confidence(waves)
            
            # Determine current wave position
            current_wave = self._determine_current_wave(waves, pivots[-1])
            
            # Generate forecast
            forecast = self._generate_forecast(waves, current_wave)
            
            return WaveCount(
                waves=waves,
                degree="minor",  # Simplified - could be enhanced
                confidence=confidence,
                current_wave=current_wave,
                forecast=forecast
            )
            
        except Exception as e:
            logger.error(f"Error identifying impulse wave: {e}")
            return None
    
    def _validate_wave_alternation(self, pivots: List[Dict[str, Any]]) -> bool:
        """Ensure wave points alternate between highs and lows"""
        try:
            types = [p['type'] for p in pivots]
            for i in range(len(types) - 1):
                if types[i] == types[i+1]:
                    return False
            return True
        except Exception as e:
            logger.error(f"Error validating wave alternation: {e}")
            return False
    
    def _calculate_wave_ratios(self, pivots: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Calculate wave lengths and ratios"""
        try:
            waves = []
            
            for i in range(len(pivots) - 1):
                start_pivot = pivots[i]
                end_pivot = pivots[i + 1]
                
                price_change = abs(end_pivot['price'] - start_pivot['price'])
                price_change_pct = price_change / start_pivot['price'] * 100
                
                waves.append({
                    "label": str(i + 1),
                    "start_idx": start_pivot['index'],
                    "end_idx": end_pivot['index'],
                    "price_start": start_pivot['price'],
                    "price_end": end_pivot['price'],
                    "length": price_change,
                    "length_pct": price_change_pct,
                    "is_up": end_pivot['price'] > start_pivot['price']
                })
            
            return waves
            
        except Exception as e:
            logger.error(f"Error calculating wave ratios: {e}")
            return []
    
    def _validate_elliott_rules(self, waves: List[Dict[str, Any]]) -> bool:
        """
        Validate basic Elliott Wave rules:
        1. Wave 2 never retraces more than 100% of Wave 1
        2. Wave 3 is never the shortest
        3. Wave 4 never overlaps Wave 1
        """
        try:
            if len(waves) < 5:
                return False
            
            # Rule 1: Wave 2 retracement
            wave1_length = waves[0]['length']
            wave2_length = waves[1]['length']
            
            if wave2_length > wave1_length:  # Wave 2 retraces more than 100%
                return False
            
            # Rule 2: Wave 3 is not the shortest
            wave3_length = waves[2]['length']
            wave5_length = waves[4]['length']
            
            if wave3_length <= min(wave1_length, wave5_length):
                return False
            
            # Rule 3: Wave 4 doesn't overlap Wave 1
            wave1_end_price = waves[0]['price_end']
            wave4_end_price = waves[3]['price_end']
            
            # Check if Wave 4 overlaps Wave 1
            if waves[0]['is_up']:  # Bullish Wave 1
                if wave4_end_price < wave1_end_price:
                    return False
            else:  # Bearish Wave 1
                if wave4_end_price > wave1_end_price:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error validating Elliott rules: {e}")
            return False
    
    def _calculate_wave_confidence(self, waves: List[Dict[str, Any]]) -> float:
        """Calculate confidence based on how well waves follow Elliott principles"""
        try:
            if len(waves) < 5:
                return 0.0
            
            confidence_factors = []
            
            # Wave 3 strength (should be strongest)
            wave3_length = waves[2]['length']
            other_waves = [waves[0]['length'], waves[4]['length']]
            if wave3_length > max(other_waves):
                confidence_factors.append(0.3)
            else:
                confidence_factors.append(0.1)
            
            # Wave 2 retracement (should be 38.2% - 61.8%)
            wave1_length = waves[0]['length']
            wave2_length = waves[1]['length']
            retracement = wave2_length / wave1_length if wave1_length > 0 else 0
            
            if 0.382 <= retracement <= 0.618:
                confidence_factors.append(0.3)
            elif 0.236 <= retracement <= 0.786:
                confidence_factors.append(0.2)
            else:
                confidence_factors.append(0.1)
            
            # Wave 4 retracement (should be 23.6% - 50%)
            wave3_length = waves[2]['length']
            wave4_length = waves[3]['length']
            retracement = wave4_length / wave3_length if wave3_length > 0 else 0
            
            if 0.236 <= retracement <= 0.5:
                confidence_factors.append(0.2)
            elif 0.146 <= retracement <= 0.618:
                confidence_factors.append(0.15)
            else:
                confidence_factors.append(0.05)
            
            # Wave 5 completion (should be 61.8% - 100% of Wave 1)
            wave5_length = waves[4]['length']
            wave1_length = waves[0]['length']
            completion = wave5_length / wave1_length if wave1_length > 0 else 0
            
            if 0.618 <= completion <= 1.0:
                confidence_factors.append(0.2)
            elif 0.5 <= completion <= 1.618:
                confidence_factors.append(0.15)
            else:
                confidence_factors.append(0.05)
            
            return float(np.clip(sum(confidence_factors), 0.0, 1.0))
            
        except Exception as e:
            logger.error(f"Error calculating wave confidence: {e}")
            return 0.0
    
    def _determine_current_wave(self, waves: List[Dict[str, Any]], last_pivot: Dict[str, Any]) -> str:
        """Determine which wave we're currently in"""
        try:
            if len(waves) < 5:
                return "unknown"
            
            # Simple heuristic: if we're in the last wave and it's still developing
            last_wave = waves[-1]
            
            # Check if we're still in Wave 5
            if last_pivot['index'] >= last_wave['start_idx']:
                return "5"
            
            # Check if we're in Wave 4
            wave4 = waves[3]
            if last_pivot['index'] >= wave4['start_idx']:
                return "4"
            
            # Check if we're in Wave 3
            wave3 = waves[2]
            if last_pivot['index'] >= wave3['start_idx']:
                return "3"
            
            # Check if we're in Wave 2
            wave2 = waves[1]
            if last_pivot['index'] >= wave2['start_idx']:
                return "2"
            
            return "1"
            
        except Exception as e:
            logger.error(f"Error determining current wave: {e}")
            return "unknown"
    
    def _generate_forecast(self, waves: List[Dict[str, Any]], current_wave: str) -> Dict[str, Any]:
        """Generate price targets and forecasts based on wave analysis"""
        try:
            if len(waves) < 5:
                return {"error": "Insufficient waves for forecast"}
            
            forecast = {
                "current_wave": current_wave,
                "targets": [],
                "probabilities": {}
            }
            
            # Calculate Fibonacci targets based on Wave 1
            wave1_length = waves[0]['length']
            wave1_end_price = waves[0]['price_end']
            
            # Common Fibonacci targets
            fib_levels = [0.618, 1.0, 1.618, 2.618]
            
            for level in fib_levels:
                if waves[0]['is_up']:  # Bullish impulse
                    target = wave1_end_price + (wave1_length * level)
                else:  # Bearish impulse
                    target = wave1_end_price - (wave1_length * level)
                
                forecast["targets"].append({
                    "level": level,
                    "price": float(target),
                    "type": "fibonacci"
                })
            
            # Wave-specific probabilities
            if current_wave == "3":
                forecast["probabilities"]["continuation"] = 0.8
                forecast["probabilities"]["reversal"] = 0.2
            elif current_wave == "5":
                forecast["probabilities"]["completion"] = 0.6
                forecast["probabilities"]["extension"] = 0.4
            else:
                forecast["probabilities"]["continuation"] = 0.6
                forecast["probabilities"]["reversal"] = 0.4
            
            return forecast
            
        except Exception as e:
            logger.error(f"Error generating forecast: {e}")
            return {"error": str(e)}
    
    def _calculate_wave_score(self, wave_count: WaveCount, ohlcv: List[Dict[str, Any]]) -> float:
        """Calculate trading score based on wave position and characteristics"""
        try:
            current_wave = wave_count.current_wave
            confidence = wave_count.confidence
            
            # Base score from confidence
            base_score = confidence * 0.5
            
            # Wave-specific scoring
            if current_wave == "3":
                # Wave 3 is typically the strongest - bullish signal
                return base_score + 0.4
            elif current_wave == "5":
                # Wave 5 completion - potential reversal signal
                return base_score - 0.2
            elif current_wave == "2":
                # Wave 2 retracement - potential continuation
                return base_score + 0.2
            elif current_wave == "4":
                # Wave 4 retracement - potential continuation
                return base_score + 0.1
            else:
                return base_score
                
        except Exception as e:
            logger.error(f"Error calculating wave score: {e}")
            return 0.0
