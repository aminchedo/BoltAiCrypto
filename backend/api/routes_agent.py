"""
Agent control endpoints for Real-Time Agent feature
"""

import logging
import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/agent", tags=["agent"])

# Agent state management
class AgentState:
    def __init__(self):
        # Read from environment variables with defaults
        self.enabled = os.getenv('REALTIME_AGENT_ENABLED', 'true').lower() == 'true'
        self.scan_interval_ms = int(os.getenv('REALTIME_SCAN_INTERVAL_MS', '1000'))
        self.subscribed_symbols = []

    def dict(self):
        return {
            "enabled": self.enabled,
            "scan_interval_ms": self.scan_interval_ms,
            "subscribed_symbols": self.subscribed_symbols
        }

# Global agent state
agent_state = AgentState()


class ToggleRequest(BaseModel):
    enabled: bool


class SubscribeRequest(BaseModel):
    symbols: list[str]


@router.get("/status")
async def get_agent_status():
    """
    Get current agent status
    
    Returns:
        dict: Current agent state including enabled flag
    """
    try:
        return agent_state.dict()
    except Exception as e:
        logger.exception("Error getting agent status")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/toggle")
async def toggle_agent(enabled: bool):
    """
    Toggle agent on/off
    
    Args:
        enabled: True to enable agent, False to disable
        
    Returns:
        dict: Updated agent state
    """
    try:
        agent_state.enabled = enabled
        
        # TODO: Start/stop live scanner task accordingly
        # This would integrate with the live_scanner from websocket.live_scanner
        if enabled:
            logger.info("Real-time agent enabled")
            # await live_scanner.start()
        else:
            logger.info("Real-time agent disabled")
            # await live_scanner.stop()
        
        return agent_state.dict()
    except Exception as e:
        logger.exception("Error toggling agent")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/subscribe")
async def subscribe_symbols(request: SubscribeRequest):
    """
    Subscribe to symbols for real-time updates
    
    Args:
        request: SubscribeRequest with list of symbols
        
    Returns:
        dict: Updated agent state with subscribed symbols
    """
    try:
        agent_state.subscribed_symbols = request.symbols
        logger.info(f"Agent subscribed to symbols: {request.symbols}")
        
        return {
            "status": "success",
            "subscribed_symbols": agent_state.subscribed_symbols
        }
    except Exception as e:
        logger.exception("Error subscribing to symbols")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config")
async def get_agent_config():
    """
    Get agent configuration
    
    Returns:
        dict: Agent configuration settings
    """
    try:
        return {
            "scan_interval_ms": agent_state.scan_interval_ms,
            "max_symbols": 50,
            "supported_timeframes": ["1m", "5m", "15m", "1h", "4h", "1d"]
        }
    except Exception as e:
        logger.exception("Error getting agent config")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/config")
async def update_agent_config(scan_interval_ms: Optional[int] = None):
    """
    Update agent configuration
    
    Args:
        scan_interval_ms: Scan interval in milliseconds (optional)
        
    Returns:
        dict: Updated configuration
    """
    try:
        if scan_interval_ms is not None:
            if scan_interval_ms < 100 or scan_interval_ms > 60000:
                raise HTTPException(
                    status_code=400,
                    detail="scan_interval_ms must be between 100 and 60000"
                )
            agent_state.scan_interval_ms = scan_interval_ms
        
        return {
            "status": "success",
            "scan_interval_ms": agent_state.scan_interval_ms
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error updating agent config")
        raise HTTPException(status_code=500, detail=str(e))
