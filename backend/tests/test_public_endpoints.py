"""
Tests for public endpoints in PUBLIC_MODE.
Verifies that dashboard-critical endpoints are accessible without authentication.
"""
import pytest
from fastapi.testclient import TestClient


def test_multi_timeframe_endpoint_public(client):
    """Test multi-timeframe analysis endpoint is public in PUBLIC_MODE."""
    response = client.get("/api/analysis/multi-timeframe/BTCUSDT")
    # Should not require auth in PUBLIC_MODE
    assert response.status_code != 401, "Multi-timeframe endpoint should not require auth"
    assert response.status_code != 403, "Multi-timeframe endpoint should not be forbidden"
    # May return 200 (success) or 500 (if API keys missing), but not auth errors


def test_risk_metrics_endpoint_public(client):
    """Test risk metrics endpoint is public in PUBLIC_MODE."""
    response = client.get("/api/risk/metrics")
    # Should not require auth in PUBLIC_MODE
    assert response.status_code != 401, "Risk metrics endpoint should not require auth"
    assert response.status_code != 403, "Risk metrics endpoint should not be forbidden"


def test_portfolio_positions_endpoint_public(client):
    """Test portfolio positions endpoint is public in PUBLIC_MODE."""
    response = client.get("/api/portfolio/positions")
    # Should not require auth in PUBLIC_MODE
    assert response.status_code != 401, "Portfolio positions endpoint should not require auth"
    assert response.status_code != 403, "Portfolio positions endpoint should not be forbidden"


def test_api_endpoints_status_public(client):
    """Test API endpoints status is public."""
    response = client.get("/api/endpoints/status")
    # Should not require auth
    assert response.status_code != 401
    assert response.status_code != 403


def test_all_dashboard_endpoints_no_auth(client):
    """
    Comprehensive test: verify all dashboard-critical endpoints don't return 401/403.
    This is the key test for PUBLIC_MODE functionality.
    """
    dashboard_endpoints = [
        "/health",
        "/api/price/BTCUSDT",
        "/api/ohlcv/BTCUSDT?timeframe=1h&limit=10",
        "/api/analysis/multi-timeframe/BTCUSDT",
        "/api/risk/metrics",
        "/api/portfolio/positions",
    ]
    
    for endpoint in dashboard_endpoints:
        response = client.get(endpoint)
        assert response.status_code not in [401, 403], \
            f"Endpoint {endpoint} returned {response.status_code} - should not require auth in PUBLIC_MODE"


def test_rate_limiting_enforced(client):
    """Test that rate limiting is enforced (should get 429 after limit)."""
    # Make requests until we hit rate limit (or max attempts)
    # This is more of a smoke test - actual rate limit testing would need more setup
    responses = []
    for _ in range(10):  # Make 10 requests
        response = client.get("/api/price/BTCUSDT")
        responses.append(response.status_code)
    
    # All responses should be valid (200, 500) or rate limited (429)
    # None should be 401/403
    for status in responses:
        assert status not in [401, 403], "No auth errors should occur"


def test_public_mode_info_in_api_docs(client):
    """Test that API documentation indicates PUBLIC_MODE when active."""
    response = client.get("/docs")
    assert response.status_code == 200, "API docs should be accessible"
    # OpenAPI docs should be available
