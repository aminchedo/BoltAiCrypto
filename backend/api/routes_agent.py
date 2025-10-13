"""
Agent control endpoints for Real-Time Agent feature
"""

import logging
import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
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


def _get_live_scanner(request: Request):
    """Get live scanner instance from app state or imports"""
    try:
        from backend.websocket.live_scanner import live_scanner
        return live_scanner
    except Exception:
        try:
            from websocket.live_scanner import live_scanner
            return live_scanner
        except Exception:
            return getattr(request.app.state, "live_scanner", None)


@router.get("/status")
async def get_agent_status(request: Request):
    """
    Get current agent status
    
    Returns:
        dict: Current agent state including enabled flag
    """
    try:
        # Get actual enabled state from app state if available
        enabled = getattr(request.app.state, "agent_enabled", agent_state.enabled)
        agent_state.enabled = enabled
        return agent_state.dict()
    except Exception as e:
        logger.exception("Error getting agent status")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/toggle")
async def toggle_agent(req: ToggleRequest, request: Request):
    """
    Toggle agent on/off - actually starts/stops the live scanner
    
    Args:
        req: ToggleRequest with enabled flag
        request: FastAPI request object
        
    Returns:
        dict: Updated agent state
    """
    try:
        ls = _get_live_scanner(request)
        
        if req.enabled:
            logger.info("Enabling real-time agent - starting live scanner")
            if ls and hasattr(ls, "start"):
                await ls.start()
            else:
                logger.warning("Live scanner not available to start")
            agent_state.enabled = True
            request.app.state.agent_enabled = True
        else:
            logger.info("Disabling real-time agent - stopping live scanner")
            if ls and hasattr(ls, "stop"):
                await ls.stop()
            else:
                logger.warning("Live scanner not available to stop")
            agent_state.enabled = False
            request.app.state.agent_enabled = False
        
        return agent_state.dict()
    except Exception as e:
        logger.exception("Error toggling agent")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/subscribe")
async def subscribe_symbols(body: SubscribeRequest, request: Request):
    """
    Subscribe to symbols for real-time updates
    
    Args:
        body: SubscribeRequest with list of symbols
        request: FastAPI request object
        
    Returns:
        dict: Updated subscription status
    """
    try:
        symbols = body.symbols or []
        agent_state.subscribed_symbols = symbols
        request.app.state.subscribed_symbols = symbols
        logger.info(f"Agent subscribed to {len(symbols)} symbols: {symbols}")
        
        # Update live scanner symbols if it's running
        ls = _get_live_scanner(request)
        if ls and hasattr(ls, "update_symbols"):
            ls.update_symbols(symbols)
            logger.info(f"Live scanner symbols updated")
        
        return {
            "symbols": symbols,
            "count": len(symbols)
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
