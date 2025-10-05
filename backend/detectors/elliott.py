"""
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
                }
            )
            
        except Exception as e:
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