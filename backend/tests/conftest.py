"""
Pytest configuration and fixtures for backend tests.
"""
import os
import pytest
from fastapi.testclient import TestClient

# Set test environment variables before importing the app
os.environ["PUBLIC_MODE"] = "true"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["ENVIRONMENT"] = "test"

from main import app


@pytest.fixture(scope="module")
def client():
    """Create a test client for the FastAPI app."""
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
def public_mode_client():
    """Create a test client with PUBLIC_MODE enabled."""
    os.environ["PUBLIC_MODE"] = "true"
    with TestClient(app) as test_client:
        yield test_client
    os.environ["PUBLIC_MODE"] = "false"
