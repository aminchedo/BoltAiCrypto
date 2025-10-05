"""
Dynamic Scoring Engine for combining detector signals
"""

import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import pandas as pd
import numpy as np

from ..api.models import WeightConfig, CombinedScore, ComponentScore
from ..detectors.base import BaseDetector, DetectionResult

class DynamicScoringEngine:
    """Combines multiple detector signals into a unified score"""
    
    def __init__(self, detectors: Dict[str, BaseDetector], weights: WeightConfig):
        self.detectors = detectors
        self.weights = weights
        self._validate_weights()
    
    def _validate_weights(self):
        """Validate that weights sum to 1.0"""
        self.weights.validate_sum()
    
    async def score(self, ohlcv: pd.DataFrame, context: Dict[str, Any] = None) -> CombinedScore:
        """
        Score OHLCV data using all detectors
        
        Args:
            ohlcv: DataFrame with OHLCV data
            context: Additional context for scoring
            
        Returns:
            CombinedScore with final score and component breakdown
        """
        if context is None:
            context = {}
        
        # Run all detectors in parallel
        detector_tasks = []
        for name, detector in self.detectors.items():
            task = asyncio.create_task(detector.detect(ohlcv, context))
            detector_tasks.append((name, task))
        
        # Wait for all detectors to complete
        detector_results = {}
        for name, task in detector_tasks:
            try:
                result = await task
                detector_results[name] = result
            except Exception as e:
                # If detector fails, use neutral result
                detector_results[name] = DetectionResult(0.5, "NEUTRAL", 0.0, {"error": str(e)})
        
        # Calculate component scores
        components = []
        weighted_scores = []
        directions = []
        confidences = []
        
        for name, result in detector_results.items():
            # Get weight for this detector
            weight = getattr(self.weights, name, 0.1)  # Default weight if not found
            
            # Create component score
            component = ComponentScore(
                detector=name,
                score=result.score,
                direction=result.direction,
                confidence=result.confidence,
                meta=result.meta
            )
            components.append(component)
            
            # Collect data for final calculation
            weighted_scores.append(result.score * weight)
            directions.append(result.direction)
            confidences.append(result.confidence)
        
        # Calculate final score
        final_score = sum(weighted_scores)
        
        # Determine overall direction
        direction = self._determine_direction(directions, weighted_scores)
        
        # Calculate confidence
        confidence = self._calculate_confidence(confidences, weighted_scores)
        
        # Calculate bull/bear mass
        bull_mass, bear_mass = self._calculate_mass(directions, weighted_scores)
        
        # Calculate disagreement
        disagreement = self._calculate_disagreement(directions, confidences)
        
        # Generate advice
        advice = self._generate_advice(final_score, direction, confidence, disagreement)
        
        return CombinedScore(
            final_score=final_score,
            direction=direction,
            advice=advice,
            confidence=confidence,
            bull_mass=bull_mass,
            bear_mass=bear_mass,
            disagreement=disagreement,
            components=components
        )
    
    def _determine_direction(self, directions: List[str], weights: List[float]) -> str:
        """Determine overall direction from component directions"""
        bullish_weight = 0
        bearish_weight = 0
        
        for direction, weight in zip(directions, weights):
            if direction == "BULLISH":
                bullish_weight += weight
            elif direction == "BEARISH":
                bearish_weight += weight
        
        if bullish_weight > bearish_weight * 1.2:  # 20% threshold
            return "BULLISH"
        elif bearish_weight > bullish_weight * 1.2:
            return "BEARISH"
        else:
            return "NEUTRAL"
    
    def _calculate_confidence(self, confidences: List[float], weights: List[float]) -> float:
        """Calculate weighted average confidence"""
        if not confidences or not weights:
            return 0.5
        
        weighted_confidence = sum(c * w for c, w in zip(confidences, weights))
        total_weight = sum(weights)
        
        return weighted_confidence / total_weight if total_weight > 0 else 0.5
    
    def _calculate_mass(self, directions: List[str], weights: List[float]) -> tuple[float, float]:
        """Calculate bull and bear mass"""
        bull_mass = 0
        bear_mass = 0
        
        for direction, weight in zip(directions, weights):
            if direction == "BULLISH":
                bull_mass += weight
            elif direction == "BEARISH":
                bear_mass += weight
        
        # Normalize to 0-1 range
        total_mass = bull_mass + bear_mass
        if total_mass > 0:
            bull_mass /= total_mass
            bear_mass /= total_mass
        
        return bull_mass, bear_mass
    
    def _calculate_disagreement(self, directions: List[str], confidences: List[float]) -> float:
        """Calculate disagreement level between detectors"""
        if len(directions) < 2:
            return 0.0
        
        # Count direction distribution
        direction_counts = {}
        for direction in directions:
            direction_counts[direction] = direction_counts.get(direction, 0) + 1
        
        # Calculate entropy (disagreement measure)
        total = len(directions)
        entropy = 0
        for count in direction_counts.values():
            if count > 0:
                p = count / total
                entropy -= p * np.log2(p)
        
        # Normalize to 0-1 range
        max_entropy = np.log2(len(direction_counts)) if len(direction_counts) > 1 else 0
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
        
        # Weight by confidence levels
        avg_confidence = np.mean(confidences) if confidences else 0.5
        disagreement = normalized_entropy * (1 - avg_confidence)
        
        return min(1.0, disagreement)
    
    def _generate_advice(self, score: float, direction: str, confidence: float, disagreement: float) -> str:
        """Generate trading advice based on score and metrics"""
        if disagreement > 0.7:
            return "HIGH_DISAGREEMENT - Wait for clearer signals"
        
        if confidence < 0.4:
            return "LOW_CONFIDENCE - Consider waiting for better setup"
        
        if direction == "BULLISH":
            if score > 0.8:
                return "STRONG_BUY - High confidence bullish signal"
            elif score > 0.65:
                return "BUY - Moderate bullish signal"
            else:
                return "WEAK_BUY - Low confidence bullish signal"
        
        elif direction == "BEARISH":
            if score < 0.2:
                return "STRONG_SELL - High confidence bearish signal"
            elif score < 0.35:
                return "SELL - Moderate bearish signal"
            else:
                return "WEAK_SELL - Low confidence bearish signal"
        
        else:  # NEUTRAL
            if score > 0.6:
                return "HOLD_BULLISH - Slight bullish bias"
            elif score < 0.4:
                return "HOLD_BEARISH - Slight bearish bias"
            else:
                return "HOLD_NEUTRAL - No clear direction"
    
    def update_weights(self, new_weights: WeightConfig):
        """Update detector weights"""
        new_weights.validate_sum()
        self.weights = new_weights
    
    def get_detector_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all detectors"""
        status = {}
        for name, detector in self.detectors.items():
            status[name] = {
                "name": detector.name,
                "weight": getattr(self.weights, name, 0.0),
                "active": True
            }
        return status