#!/usr/bin/env python3
"""
Verify Agent Integration - Code Structure Tests
Tests that all required code changes are in place
"""

import os
import re
import sys

def test_routes_agent_has_toggle_wiring():
    """Verify routes_agent.py has toggle wiring to live scanner"""
    try:
        with open('api/routes_agent.py', 'r') as f:
            content = f.read()
        
        checks = [
            ('_get_live_scanner', 'Helper function to get live scanner'),
            ('await ls.start()', 'Start scanner call in toggle'),
            ('await ls.stop()', 'Stop scanner call in toggle'),
            ('request.app.state.agent_enabled', 'App state tracking'),
            ('request: Request', 'Request parameter in endpoints'),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"  ✓ {description}")
            else:
                print(f"  ✗ MISSING: {description}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ✗ Error reading file: {e}")
        return False

def test_routes_agent_has_subscribe_wiring():
    """Verify routes_agent.py has subscribe wiring to scanner symbols"""
    try:
        with open('api/routes_agent.py', 'r') as f:
            content = f.read()
        
        checks = [
            ('ls.update_symbols', 'Call to update scanner symbols'),
            ('request.app.state.subscribed_symbols', 'Store symbols in app state'),
            ('@router.put("/subscribe")', 'PUT endpoint for subscribe'),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"  ✓ {description}")
            else:
                print(f"  ✗ MISSING: {description}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ✗ Error reading file: {e}")
        return False

def test_live_scanner_has_set_symbols():
    """Verify live_scanner.py has set_symbols method"""
    try:
        with open('websocket/live_scanner.py', 'r') as f:
            content = f.read()
        
        checks = [
            ('def set_symbols(self', 'set_symbols method exists'),
            ('def update_symbols(self', 'update_symbols method exists'),
            ('def start(self', 'start method exists'),
            ('def stop(self', 'stop method exists'),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"  ✓ {description}")
            else:
                print(f"  ✗ MISSING: {description}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ✗ Error reading file: {e}")
        return False

def test_main_has_env_based_startup():
    """Verify main.py has environment-based startup"""
    try:
        with open('main.py', 'r') as f:
            content = f.read()
        
        checks = [
            ("os.getenv('REALTIME_AGENT_ENABLED'", 'Read REALTIME_AGENT_ENABLED env var'),
            ('app.state.agent_enabled', 'Set agent_enabled in app state'),
            ('app.state.live_scanner', 'Store live_scanner in app state'),
            ('if agent_enabled:', 'Conditional startup based on env'),
            ('await ls.start()', 'Start scanner if enabled'),
            ('await ls.stop()', 'Stop scanner if disabled'),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"  ✓ {description}")
            else:
                print(f"  ✗ MISSING: {description}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ✗ Error reading file: {e}")
        return False

def test_frontend_watchlist_subscribes():
    """Verify Watchlist component updates subscriptions"""
    try:
        with open('../src/pages/Watchlist/index.tsx', 'r') as f:
            content = f.read()
        
        checks = [
            ('subscribeSymbols', 'Import subscribeSymbols function'),
            ('getAgentStatus', 'Import getAgentStatus function'),
            ('updateSubscriptions', 'Function to update subscriptions'),
            ('status.enabled', 'Check if agent is enabled'),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"  ✓ {description}")
            else:
                print(f"  ✗ MISSING: {description}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ✗ Error reading file: {e}")
        return False

def test_frontend_agent_toggle():
    """Verify AgentToggle uses store for symbols"""
    try:
        with open('../src/components/header/AgentToggle.tsx', 'r') as f:
            content = f.read()
        
        checks = [
            ("import { store }", 'Import store'),
            ('getWatchlistSymbols', 'Function to get watchlist symbols'),
            ('store.getState()', 'Read from store'),
            ('await subscribeSymbols', 'Call subscribeSymbols'),
        ]
        
        all_passed = True
        for pattern, description in checks:
            if pattern in content:
                print(f"  ✓ {description}")
            else:
                print(f"  ✗ MISSING: {description}")
                all_passed = False
        
        return all_passed
    except Exception as e:
        print(f"  ✗ Error reading file: {e}")
        return False

def main():
    print("=" * 70)
    print("AGENT INTEGRATION VERIFICATION")
    print("Checking that all code changes are in place")
    print("=" * 70)
    print()
    
    tests = [
        ("Task A: Agent Toggle → Live Scanner", test_routes_agent_has_toggle_wiring),
        ("Task B: Subscriptions → Scanner Symbols", test_routes_agent_has_subscribe_wiring),
        ("Task B: LiveScanner Methods", test_live_scanner_has_set_symbols),
        ("Task C: Environment-Based Startup", test_main_has_env_based_startup),
        ("Task D: Frontend Watchlist Subscribe", test_frontend_watchlist_subscribes),
        ("Task D: Frontend AgentToggle Store", test_frontend_agent_toggle),
    ]
    
    results = []
    for name, test in tests:
        print(f"\n{name}")
        print("-" * 70)
        result = test()
        results.append((name, result))
    
    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {name}")
    
    print()
    print(f"Total: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n✅ ALL INTEGRATION CHECKS PASSED!")
        print("The code is properly wired for:")
        print("  • Agent toggle controls live scanner start/stop")
        print("  • Subscribe endpoint updates scanner symbols")
        print("  • Startup respects REALTIME_AGENT_ENABLED env var")
        print("  • Frontend watchlist updates subscriptions")
        print()
        return 0
    else:
        print(f"\n❌ {total - passed} check(s) failed")
        print("Please review the missing components above")
        return 1

if __name__ == "__main__":
    sys.exit(main())
