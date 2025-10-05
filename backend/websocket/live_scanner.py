"""
Live Scanner for Real-Time Market Monitoring
"""

import asyncio
import logging
from datetime import datetime
from typing import List, Dict, Any
import pandas as pd

from .manager import manager
from ..scoring.engine import DynamicScoringEngine
from ..scoring.scanner import MultiTimeframeScanner
from ..data.data_manager import data_manager
from ..api.models import WeightConfig, ScanRule

logger = logging.getLogger(__name__)

class LiveScanner:
    """Continuously scan markets and push real-time updates"""
    
    def __init__(self, scoring_engine: DynamicScoringEngine, scanner: MultiTimeframeScanner):
        self.scoring_engine = scoring_engine
        self.scanner = scanner
        self.is_running = False
        self.scan_interval = 30  # seconds
        self.symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "ADAUSDT", "SOLUSDT", "XRPUSDT"]
        self.timeframes = ["15m", "1h"]
        self.last_scan_time = None
        self.scan_results_cache = {}
        
    async def start(self):
        """Start the live scanner"""
        if self.is_running:
            logger.warning("Live scanner is already running")
            return
        
        self.is_running = True
        logger.info("Starting live scanner...")
        
        # Start background task
        asyncio.create_task(self._scan_loop())
        
    async def stop(self):
        """Stop the live scanner"""
        self.is_running = False
        logger.info("Live scanner stopped")
    
    async def _scan_loop(self):
        """Main scanning loop"""
        while self.is_running:
            try:
                start_time = datetime.now()
                
                # Perform market scan
                await self._perform_market_scan()
                
                # Calculate scan duration
                scan_duration = (datetime.now() - start_time).total_seconds()
                logger.debug(f"Market scan completed in {scan_duration:.2f} seconds")
                
                # Wait for next scan
                await asyncio.sleep(self.scan_interval)
                
            except Exception as e:
                logger.error(f"Error in scan loop: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _perform_market_scan(self):
        """Perform comprehensive market scan"""
        try:
            # Create scan rules
            scan_rules = ScanRule(
                min_score=0.6,
                min_confidence=0.5,
                max_risk_level="MEDIUM"
            )
            
            # Run scanner
            results = await self.scanner.scan(
                symbols=self.symbols,
                timeframes=self.timeframes,
                rules=scan_rules
            )
            
            # Cache results
            self.scan_results_cache = {result.symbol: result for result in results}
            self.last_scan_time = datetime.now()
            
            # Send updates to WebSocket clients
            await self._send_scan_updates(results)
            
            # Send individual symbol updates
            await self._send_symbol_updates(results)
            
        except Exception as e:
            logger.error(f"Error performing market scan: {e}")
    
    async def _send_scan_updates(self, results: List[Any]):
        """Send market scan results to all clients"""
        try:
            # Convert results to dict format
            scan_data = []
            for result in results[:20]:  # Top 20 results
                scan_data.append({
                    "symbol": result.symbol,
                    "overall_score": result.overall_score,
                    "direction": result.overall_direction,
                    "action": result.recommended_action,
                    "risk_level": result.risk_level,
                    "consensus_strength": result.consensus_strength,
                    "timeframe_scores": {
                        tf: {
                            "score": score.final_score,
                            "direction": score.direction,
                            "confidence": score.confidence
                        }
                        for tf, score in result.timeframe_scores.items()
                    }
                })
            
            # Send to all clients
            await manager.send_market_scan_update(scan_data)
            
        except Exception as e:
            logger.error(f"Error sending scan updates: {e}")
    
    async def _send_symbol_updates(self, results: List[Any]):
        """Send individual symbol updates to subscribed clients"""
        try:
            for result in results:
                # Send signal update
                signal_data = {
                    "overall_score": result.overall_score,
                    "direction": result.overall_direction,
                    "action": result.recommended_action,
                    "confidence": result.consensus_strength,
                    "risk_level": result.risk_level
                }
                
                await manager.send_signal_update(result.symbol, signal_data)
                
                # Send price update (would fetch real price in production)
                price_data = await self._get_price_data(result.symbol)
                if price_data:
                    await manager.send_price_update(result.symbol, price_data)
                
        except Exception as e:
            logger.error(f"Error sending symbol updates: {e}")
    
    async def _get_price_data(self, symbol: str) -> Dict[str, Any]:
        """Get current price data for symbol"""
        try:
            # In production, this would fetch real-time price data
            # For now, return mock data
            return {
                "price": 45000.0,  # Mock price
                "change_24h": 2.5,  # Mock 24h change %
                "volume_24h": 1000000  # Mock volume
            }
        except Exception as e:
            logger.error(f"Error getting price data for {symbol}: {e}")
            return None
    
    async def get_symbol_score(self, symbol: str) -> Dict[str, Any]:
        """Get current score for a specific symbol"""
        try:
            if symbol in self.scan_results_cache:
                result = self.scan_results_cache[symbol]
                return {
                    "symbol": symbol,
                    "overall_score": result.overall_score,
                    "direction": result.overall_direction,
                    "action": result.recommended_action,
                    "confidence": result.consensus_strength,
                    "risk_level": result.risk_level,
                    "last_updated": self.last_scan_time.isoformat() if self.last_scan_time else None
                }
            else:
                return {
                    "symbol": symbol,
                    "error": "Symbol not found in recent scan results"
                }
        except Exception as e:
            logger.error(f"Error getting symbol score for {symbol}: {e}")
            return {
                "symbol": symbol,
                "error": str(e)
            }
    
    async def force_scan(self, symbols: List[str] = None):
        """Force immediate scan of specified symbols"""
        try:
            if symbols is None:
                symbols = self.symbols
            
            logger.info(f"Forcing scan for symbols: {symbols}")
            
            # Perform immediate scan
            scan_rules = ScanRule(min_score=0.5, min_confidence=0.4)
            results = await self.scanner.scan(
                symbols=symbols,
                timeframes=self.timeframes,
                rules=scan_rules
            )
            
            # Send updates
            await self._send_scan_updates(results)
            await self._send_symbol_updates(results)
            
            logger.info(f"Force scan completed for {len(results)} symbols")
            
        except Exception as e:
            logger.error(f"Error in force scan: {e}")
    
    def get_scanner_status(self) -> Dict[str, Any]:
        """Get current scanner status"""
        return {
            "is_running": self.is_running,
            "scan_interval": self.scan_interval,
            "symbols": self.symbols,
            "timeframes": self.timeframes,
            "last_scan_time": self.last_scan_time.isoformat() if self.last_scan_time else None,
            "cached_symbols": list(self.scan_results_cache.keys()),
            "total_cached_results": len(self.scan_results_cache)
        }
    
    def update_symbols(self, symbols: List[str]):
        """Update the list of symbols to scan"""
        self.symbols = symbols
        logger.info(f"Updated symbols to scan: {symbols}")
    
    def set_symbols(self, symbols: List[str]):
        """Alias for update_symbols - set the list of symbols to scan"""
        self.update_symbols(symbols)
    
    def update_scan_interval(self, interval: int):
        """Update scan interval in seconds"""
        self.scan_interval = max(10, interval)  # Minimum 10 seconds
        logger.info(f"Updated scan interval to {self.scan_interval} seconds")

# Global live scanner instance
live_scanner = None

async def initialize_live_scanner(scoring_engine: DynamicScoringEngine, scanner: MultiTimeframeScanner):
    """Initialize the global live scanner"""
    global live_scanner
    live_scanner = LiveScanner(scoring_engine, scanner)
    await live_scanner.start()
    return live_scanner

async def get_live_scanner() -> LiveScanner:
    """Get the global live scanner instance"""
    return live_scanner