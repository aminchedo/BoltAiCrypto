"""
<<<<<<< HEAD
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
=======
Elliott Wave Detector
Detects Elliott Wave patterns and cycles
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List
from .base import BaseDetector, DetectionResult

class ElliottWaveDetector(BaseDetector):
    """Detects Elliott Wave patterns"""
    
    def __init__(self):
        super().__init__("elliott")
    
    async def detect(self, ohlcv: pd.DataFrame, context: Dict[str, Any] = None) -> DetectionResult:
        """Detect Elliott Wave patterns in OHLCV data"""
        try:
            if len(ohlcv) < 50:
                return DetectionResult(0.5, "NEUTRAL", 0.0, {"error": "Insufficient data"})
            
            # Get price data
            closes = ohlcv['close'].values
            highs = ohlcv['high'].values
            lows = ohlcv['low'].values
            
            # Analyze recent price action for wave patterns
            recent_closes = closes[-50:]
            recent_highs = highs[-50:]
            recent_lows = lows[-50:]
            
            # Detect wave structure
            wave_analysis = self._analyze_wave_structure(recent_closes, recent_highs, recent_lows)
            
            if not wave_analysis:
                return DetectionResult(0.5, "NEUTRAL", 0.0, {"waves": []})
            
            # Calculate score based on wave clarity and completion
            score = self._calculate_wave_score(wave_analysis)
            direction = self._determine_wave_direction(wave_analysis)
            confidence = self._calculate_confidence(score, context)
            
            return DetectionResult(
                score=score,
                direction=direction,
                confidence=confidence,
                meta={
                    "wave_analysis": wave_analysis,
                    "current_phase": wave_analysis.get('current_phase', 'unknown')
>>>>>>> cursor/implement-and-enhance-trading-system-phases-54b6
                }
            )
            
        except Exception as e:
<<<<<<< HEAD
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
=======
            return DetectionResult(0.5, "NEUTRAL", 0.0, {"error": str(e)})
    
    def _analyze_wave_structure(self, closes: np.ndarray, highs: np.ndarray, lows: np.ndarray) -> Dict[str, Any]:
        """Analyze Elliott Wave structure"""
        # Find significant turning points
        turning_points = self._find_turning_points(closes)
        
        if len(turning_points) < 4:
            return None
        
        # Identify wave patterns
        waves = self._identify_waves(turning_points, closes)
        
        if not waves:
            return None
        
        # Analyze wave relationships
        wave_analysis = self._analyze_wave_relationships(waves)
        
        return wave_analysis
    
    def _find_turning_points(self, closes: np.ndarray, min_change: float = 0.02) -> List[int]:
        """Find significant turning points in price"""
        turning_points = []
        
        for i in range(2, len(closes) - 2):
            # Check for local maxima
            if (closes[i] > closes[i-1] and closes[i] > closes[i+1] and
                closes[i] > closes[i-2] and closes[i] > closes[i+2]):
                turning_points.append(i)
            
            # Check for local minima
            elif (closes[i] < closes[i-1] and closes[i] < closes[i+1] and
                  closes[i] < closes[i-2] and closes[i] < closes[i+2]):
                turning_points.append(i)
        
        return turning_points
    
    def _identify_waves(self, turning_points: List[int], closes: np.ndarray) -> List[Dict[str, Any]]:
        """Identify Elliott Wave patterns from turning points"""
        waves = []
        
        for i in range(len(turning_points) - 1):
            start_idx = turning_points[i]
            end_idx = turning_points[i + 1]
            
            price_change = closes[end_idx] - closes[start_idx]
            price_change_pct = price_change / closes[start_idx]
            
            # Determine if it's an impulse or corrective wave
            wave_type = "impulse" if abs(price_change_pct) > 0.03 else "corrective"
            
            waves.append({
                'start': start_idx,
                'end': end_idx,
                'start_price': closes[start_idx],
                'end_price': closes[end_idx],
                'change': price_change,
                'change_pct': price_change_pct,
                'type': wave_type,
                'direction': "up" if price_change > 0 else "down"
            })
        
        return waves
    
    def _analyze_wave_relationships(self, waves: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze relationships between waves"""
        if len(waves) < 3:
            return None
        
        # Get recent waves
        recent_waves = waves[-5:]  # Last 5 waves
        
        # Check for 5-wave impulse pattern
        impulse_pattern = self._check_impulse_pattern(recent_waves)
        
        # Check for 3-wave corrective pattern
        corrective_pattern = self._check_corrective_pattern(recent_waves)
        
        # Determine current phase
        current_phase = self._determine_current_phase(recent_waves)
        
        return {
            'waves': recent_waves,
            'impulse_pattern': impulse_pattern,
            'corrective_pattern': corrective_pattern,
            'current_phase': current_phase,
            'pattern_strength': max(
                impulse_pattern.get('strength', 0),
                corrective_pattern.get('strength', 0)
            )
        }
    
    def _check_impulse_pattern(self, waves: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check for 5-wave impulse pattern"""
        if len(waves) < 5:
            return {'strength': 0, 'valid': False}
        
        # Check if we have 5 waves with alternating directions
        pattern_waves = waves[-5:]
        
        # Wave 1: up
        # Wave 2: down (retracement)
        # Wave 3: up (strongest)
        # Wave 4: down (retracement)
        # Wave 5: up
        
        expected_directions = ['up', 'down', 'up', 'down', 'up']
        actual_directions = [w['direction'] for w in pattern_waves]
        
        direction_match = sum(1 for exp, act in zip(expected_directions, actual_directions) if exp == act)
        direction_score = direction_match / len(expected_directions)
        
        # Check wave relationships
        relationship_score = 0
        if len(pattern_waves) >= 3:
            # Wave 3 should be the strongest
            wave3_strength = abs(pattern_waves[2]['change_pct'])
            wave1_strength = abs(pattern_waves[0]['change_pct'])
            wave5_strength = abs(pattern_waves[4]['change_pct'])
            
            if wave3_strength > wave1_strength and wave3_strength > wave5_strength:
                relationship_score += 0.5
        
        total_strength = (direction_score + relationship_score) / 2
        
        return {
            'strength': total_strength,
            'valid': total_strength > 0.6,
            'waves': pattern_waves
        }
    
    def _check_corrective_pattern(self, waves: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Check for 3-wave corrective pattern (ABC)"""
        if len(waves) < 3:
            return {'strength': 0, 'valid': False}
        
        # Check for ABC correction
        pattern_waves = waves[-3:]
        expected_directions = ['down', 'up', 'down']  # A, B, C
        actual_directions = [w['direction'] for w in pattern_waves]
        
        direction_match = sum(1 for exp, act in zip(expected_directions, actual_directions) if exp == act)
        direction_score = direction_match / len(expected_directions)
        
        return {
            'strength': direction_score,
            'valid': direction_score > 0.6,
            'waves': pattern_waves
        }
    
    def _determine_current_phase(self, waves: List[Dict[str, Any]]) -> str:
        """Determine current Elliott Wave phase"""
        if not waves:
            return "unknown"
        
        last_wave = waves[-1]
        
        # Simple phase determination based on recent wave
        if last_wave['direction'] == 'up':
            return "bullish_phase"
        else:
            return "bearish_phase"
    
    def _calculate_wave_score(self, wave_analysis: Dict[str, Any]) -> float:
        """Calculate overall wave score"""
        if not wave_analysis:
            return 0.5
        
        pattern_strength = wave_analysis.get('pattern_strength', 0)
        impulse_strength = wave_analysis.get('impulse_pattern', {}).get('strength', 0)
        corrective_strength = wave_analysis.get('corrective_pattern', {}).get('strength', 0)
        
        # Weight impulse patterns more heavily
        total_strength = (impulse_strength * 0.7 + corrective_strength * 0.3)
        
        return self._normalize_score(total_strength)
    
    def _determine_wave_direction(self, wave_analysis: Dict[str, Any]) -> str:
        """Determine overall wave direction"""
        if not wave_analysis:
            return "NEUTRAL"
        
        current_phase = wave_analysis.get('current_phase', 'unknown')
        
        if 'bullish' in current_phase:
            return "BULLISH"
        elif 'bearish' in current_phase:
            return "BEARISH"
        else:
            return "NEUTRAL"
>>>>>>> cursor/implement-and-enhance-trading-system-phases-54b6
