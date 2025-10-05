"""
Health and basic endpoint tests.
Ensures no 401/403 for dashboard-critical endpoints in PUBLIC_MODE.
"""
import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_health_no_auth_required(client):
    """Verify health endpoint doesn't require authentication."""
    response = client.get("/health")
    assert response.status_code != 401
    assert response.status_code != 403


def test_price_endpoint_public_access(client):
    """Test price endpoint is accessible without auth in PUBLIC_MODE."""
    response = client.get("/api/price/BTCUSDT")
    # Should return 200 (success) or 5xx (server error), but NEVER 401/403
    assert response.status_code != 401, "Price endpoint should not require auth in PUBLIC_MODE"
    assert response.status_code != 403, "Price endpoint should not be forbidden in PUBLIC_MODE"


def test_ohlcv_endpoint_public_access(client):
    """Test OHLCV endpoint is accessible without auth in PUBLIC_MODE."""
    response = client.get("/api/ohlcv/BTCUSDT?timeframe=1h&limit=10")
    # Should return 200 (success) or 5xx (server error), but NEVER 401/403
    assert response.status_code != 401, "OHLCV endpoint should not require auth in PUBLIC_MODE"
    assert response.status_code != 403, "OHLCV endpoint should not be forbidden in PUBLIC_MODE"


def test_security_headers_present(client):
    """Verify security headers are present in responses."""
    response = client.get("/health")
    headers = response.headers
    
    # Check for security headers
    assert "x-content-type-options" in headers.lower() or "X-Content-Type-Options" in headers
    assert "x-frame-options" in headers.lower() or "X-Frame-Options" in headers
    

def test_rate_limit_headers_present(client):
    """Verify rate limit headers are present in responses."""
    response = client.get("/health")
    headers = response.headers
    
    # Rate limit headers should be present
    assert any("ratelimit" in h.lower() for h in headers.keys()), \
        "Rate limit headers should be present"


def test_cors_headers_present(client):
    """Verify CORS headers are configured."""
    response = client.options("/health", headers={"Origin": "http://localhost:5173"})
    # CORS headers should be present for OPTIONS requests
    assert response.status_code in [200, 204], "OPTIONS request should succeed"
