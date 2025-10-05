"""
WebSocket Connection Manager for Real-Time Updates
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Set, Dict, List, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manage WebSocket connections and subscriptions"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscriptions: Dict[WebSocket, Set[str]] = {}
        self.symbol_subscribers: Dict[str, Set[WebSocket]] = {}
        self.message_count = 0
        self.last_performance_check = datetime.now()
        self.latency_measurements = []
    
    async def connect(self, websocket: WebSocket):
        """Accept new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        self.subscriptions[websocket] = set()
        logger.info(f"Client connected. Total clients: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection"""
        self.active_connections.discard(websocket)
        
        # Remove from all symbol subscriptions
        if websocket in self.subscriptions:
            for symbol in self.subscriptions[websocket]:
                if symbol in self.symbol_subscribers:
                    self.symbol_subscribers[symbol].discard(websocket)
            del self.subscriptions[websocket]
        
        logger.info(f"Client disconnected. Total clients: {len(self.active_connections)}")
    
    async def subscribe(self, websocket: WebSocket, symbol: str):
        """Subscribe to symbol updates"""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].add(symbol)
            
            # Add to symbol subscribers
            if symbol not in self.symbol_subscribers:
                self.symbol_subscribers[symbol] = set()
            self.symbol_subscribers[symbol].add(websocket)
            
            logger.info(f"Client subscribed to {symbol}")
    
    async def unsubscribe(self, websocket: WebSocket, symbol: str):
        """Unsubscribe from symbol updates"""
        if websocket in self.subscriptions:
            self.subscriptions[websocket].discard(symbol)
            
            # Remove from symbol subscribers
            if symbol in self.symbol_subscribers:
                self.symbol_subscribers[symbol].discard(websocket)
            
            logger.info(f"Client unsubscribed from {symbol}")
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
        
        disconnected = set()
        message_json = json.dumps(message, default=str)
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message_json)
                self.message_count += 1
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                disconnected.add(connection)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.disconnect(conn)
    
    async def send_to_subscribed(self, symbol: str, data: dict):
        """Send data to clients subscribed to specific symbol"""
        if symbol not in self.symbol_subscribers:
            return
        
        message = {
            "type": "signal_update",
            "symbol": symbol,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        message_json = json.dumps(message, default=str)
        disconnected = set()
        
        for websocket in self.symbol_subscribers[symbol].copy():
            try:
                await websocket.send_text(message_json)
                self.message_count += 1
            except Exception as e:
                logger.warning(f"Failed to send to subscribed client: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected connections
        for conn in disconnected:
            self.disconnect(conn)
    
    async def send_price_update(self, symbol: str, price_data: dict):
        """Send price update to subscribed clients"""
        message = {
            "type": "price_update",
            "symbol": symbol,
            "price": price_data.get("price", 0),
            "change_24h": price_data.get("change_24h", 0),
            "volume_24h": price_data.get("volume_24h", 0),
            "timestamp": datetime.now().isoformat()
        }
        
        await self.send_to_subscribed(symbol, message)
    
    async def send_signal_update(self, symbol: str, signal_data: dict):
        """Send signal update to subscribed clients"""
        message = {
            "type": "signal_update",
            "symbol": symbol,
            "signal": signal_data,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.send_to_subscribed(symbol, message)
    
    async def send_market_scan_update(self, scan_results: List[dict]):
        """Send market scan results to all clients"""
        message = {
            "type": "market_scan",
            "results": scan_results,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(message)
    
    async def send_system_status(self, status: dict):
        """Send system status update"""
        message = {
            "type": "system_status",
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(message)
    
    def get_connection_stats(self) -> dict:
        """Get connection statistics"""
        return {
            "active_connections": len(self.active_connections),
            "total_subscriptions": sum(len(subs) for subs in self.subscriptions.values()),
            "symbol_subscribers": {symbol: len(subs) for symbol, subs in self.symbol_subscribers.items()},
            "message_count": self.message_count,
            "uptime": (datetime.now() - self.last_performance_check).total_seconds()
        }
    
    async def ping_all_clients(self):
        """Send ping to all clients to check connectivity"""
        ping_message = {
            "type": "ping",
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(ping_message)

# Global connection manager instance
manager = ConnectionManager()