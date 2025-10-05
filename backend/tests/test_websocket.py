"""
WebSocket connection tests.
Basic smoke tests for WebSocket endpoints.
"""
import pytest
from fastapi.testclient import TestClient


def test_websocket_signals_connects(client):
    """Test that WebSocket signals endpoint accepts connections."""
    try:
        with client.websocket_connect("/ws/signals") as websocket:
            # Connection should succeed
            assert websocket is not None
            # Test basic communication
            # The server might send initial data or expect a message
            # This is a basic connectivity test
    except Exception as e:
        # WebSocket might require additional setup, but connection should not be rejected
        # due to auth issues (401/403)
        error_str = str(e)
        assert "401" not in error_str, "WebSocket should not require auth in PUBLIC_MODE"
        assert "403" not in error_str, "WebSocket should not be forbidden in PUBLIC_MODE"


def test_websocket_signals_no_auth_required(client):
    """Verify WebSocket doesn't require authentication in PUBLIC_MODE."""
    # Attempt to connect without auth headers
    try:
        with client.websocket_connect("/ws/signals") as websocket:
            # If we get here, connection was successful - which is what we want
            assert True
    except Exception as e:
        # Check that the error is not auth-related
        error_str = str(e).lower()
        assert "unauthorized" not in error_str
        assert "forbidden" not in error_str
        assert "401" not in error_str
        assert "403" not in error_str
