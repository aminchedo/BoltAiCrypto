#!/usr/bin/env python3
"""
Smoke tests for Agent Integration
Tests agent toggle and subscription endpoints
"""

import sys
import asyncio
from typing import Any

# Mock imports for testing without running full server
class MockRequest:
    class State:
        def __init__(self):
            self.agent_enabled = True
            self.live_scanner = None
            self.subscribed_symbols = []
    
    def __init__(self):
        self.app = type('obj', (object,), {'state': self.State()})()

async def test_routes_import():
    """Test that routes can be imported successfully"""
    try:
        from api.routes_agent import router, _get_live_scanner, agent_state
        print("✓ Successfully imported routes_agent module")
        return True
    except Exception as e:
        print(f"✗ Failed to import routes_agent: {e}")
        return False

async def test_live_scanner_methods():
    """Test that live scanner has required methods"""
    try:
        from websocket.live_scanner import LiveScanner
        
        # Check for required methods
        required_methods = ['start', 'stop', 'update_symbols', 'set_symbols', 'is_running']
        
        for method in required_methods:
            if hasattr(LiveScanner, method):
                print(f"✓ LiveScanner has method: {method}")
            else:
                print(f"✗ LiveScanner missing method: {method}")
                return False
        
        return True
    except Exception as e:
        print(f"✗ Failed to check LiveScanner: {e}")
        return False

async def test_main_startup_logic():
    """Test that main.py has correct startup logic"""
    try:
        with open('main.py', 'r') as f:
            content = f.read()
        
        # Check for key integration points
        checks = [
            ('REALTIME_AGENT_ENABLED', 'Environment variable check'),
            ('app.state.agent_enabled', 'App state initialization'),
            ('app.state.live_scanner', 'Scanner storage in app state'),
            ('await ls.start()', 'Scanner start call'),
            ('await ls.stop()', 'Scanner stop call'),
        ]
        
        for pattern, description in checks:
            if pattern in content:
                print(f"✓ Found {description}: {pattern}")
            else:
                print(f"✗ Missing {description}: {pattern}")
                return False
        
        return True
    except Exception as e:
        print(f"✗ Failed to check main.py: {e}")
        return False

async def test_agent_state():
    """Test agent state management"""
    try:
        from api.routes_agent import agent_state
        
        # Check that agent state has required attributes
        if hasattr(agent_state, 'enabled'):
            print(f"✓ Agent state has 'enabled': {agent_state.enabled}")
        else:
            print("✗ Agent state missing 'enabled'")
            return False
        
        if hasattr(agent_state, 'subscribed_symbols'):
            print(f"✓ Agent state has 'subscribed_symbols': {agent_state.subscribed_symbols}")
        else:
            print("✗ Agent state missing 'subscribed_symbols'")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Failed to check agent state: {e}")
        return False

async def main():
    """Run all smoke tests"""
    print("="*60)
    print("AGENT INTEGRATION SMOKE TESTS")
    print("="*60)
    print()
    
    tests = [
        ("Routes Import", test_routes_import),
        ("LiveScanner Methods", test_live_scanner_methods),
        ("Main Startup Logic", test_main_startup_logic),
        ("Agent State", test_agent_state),
    ]
    
    results = []
    for name, test in tests:
        print(f"\n--- Testing: {name} ---")
        result = await test()
        results.append((name, result))
        print()
    
    print("="*60)
    print("TEST RESULTS SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print()
    print(f"Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✅ All smoke tests passed!")
        return 0
    else:
        print(f"\n❌ {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
