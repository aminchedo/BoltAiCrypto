# Real-Time Agent Integration Runbook

## Overview

This runbook provides operational procedures for deploying, monitoring, and maintaining the Real-Time Opportunity Agent system. The agent continuously scans markets, scores signals, and streams updates via WebSocket to connected clients.

## Architecture

### Components

1. **Backend (FastAPI)**
   - Agent control endpoints (`/api/agent/*`)
   - WebSocket server (`/ws/realtime`)
   - Multi-timeframe scanner
   - Signal scoring engine
   - Risk management
   - Backtest engine

2. **Frontend (React + TypeScript)**
   - Agent toggle control
   - WebSocket status badge
   - Real-time scanner results
   - Risk and backtest panels

3. **Data Flow**
   - UI → Agent Toggle → Backend Agent State
   - Agent State → Live Scanner (start/stop)
   - Live Scanner → WebSocket Manager → Connected Clients
   - Clients → Subscribe/Unsubscribe → Symbol-specific updates

## Deployment

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL (optional, for persistence)
- Redis (optional, for caching)

### Environment Variables

```bash
# Backend
REALTIME_AGENT_ENABLED=true
REALTIME_SCAN_INTERVAL_MS=30000
DATABASE_URL=postgresql://user:pass@localhost:5432/hts
REDIS_URL=redis://localhost:6379

# Frontend
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Installation

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend

```bash
npm install
```

### Starting Services

#### Development

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

#### Production

**Backend (with Gunicorn):**
```bash
cd backend
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

**Frontend (build and serve):**
```bash
npm run build
npm run preview
```

## Operations

### Enabling/Disabling the Agent

#### Via UI
1. Navigate to the dashboard
2. Click the "Agent Toggle" button in the header
3. Verify the WebSocket badge shows "CONNECTED"

#### Via API
```bash
# Enable agent
curl -X PUT "http://localhost:8000/api/agent/toggle?enabled=true"

# Disable agent
curl -X PUT "http://localhost:8000/api/agent/toggle?enabled=false"

# Check status
curl http://localhost:8000/api/agent/status
```

Expected response:
```json
{
  "enabled": true,
  "scan_interval_ms": 30000,
  "subscribed_symbols": []
}
```

### Monitoring

#### Health Check
```bash
curl http://localhost:8000/health
```

#### Metrics Endpoint
```bash
curl http://localhost:8000/api/metrics
```

Expected response:
```json
{
  "timestamp": "2025-10-05T12:00:00",
  "websocket": {
    "connections": 5,
    "subscriptions": 12,
    "messages_sent": 1523,
    "uptime": 3600
  },
  "agent": {
    "enabled": true,
    "scan_interval_ms": 30000
  },
  "system": {
    "active_signals": 8,
    "version": "1.0.0"
  }
}
```

#### WebSocket Testing

**Using wscat:**
```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws/realtime

# After connection, subscribe:
> {"action": "subscribe", "symbols": ["BTCUSDT", "ETHUSDT"]}

# Expect:
< {"type": "subscription_confirmed", "symbols": ["BTCUSDT", "ETHUSDT"]}

# Then periodic signal messages:
< {"type": "signal", "symbol": "BTCUSDT", "direction": "BULLISH", "confidence": 0.75, ...}
```

**Using Browser Console:**
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/realtime');

ws.onopen = () => {
  console.log('Connected');
  ws.send(JSON.stringify({action: 'subscribe', symbols: ['BTCUSDT', 'ETHUSDT']}));
};

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log('Message:', data);
};

ws.onerror = (e) => console.error('Error:', e);
ws.onclose = () => console.log('Disconnected');
```

### Running Manual Scans

```bash
# Run scanner for specific symbols
curl -X POST http://localhost:8000/api/scanner/run \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["BTCUSDT", "ETHUSDT", "BNBUSDT"],
    "timeframes": ["15m", "1h", "4h", "1d"]
  }'
```

### Scoring Individual Signals

```bash
curl -X POST http://localhost:8000/api/signals/score \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "timeframe": "1h"
  }'
```

Expected response:
```json
{
  "direction": "BULLISH",
  "confidence": 0.78,
  "advice": "BUY - Risk: MEDIUM"
}
```

### Running Backtests

```bash
curl -X POST http://localhost:8000/api/backtest/run \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "start_date": "2024-01-01",
    "end_date": "2024-02-01",
    "initial_capital": 10000,
    "fee": 0.0005,
    "slippage": 0.001
  }'
```

### Risk Management

#### Get Risk Status
```bash
curl http://localhost:8000/api/risk/status
```

#### Calculate Position Size
```bash
curl -X POST http://localhost:8000/api/risk/calculate-position \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "entry_price": 45000,
    "stop_loss": 44000,
    "account_size": 10000,
    "risk_percent": 2
  }'
```

### Weight Configuration

#### Get Current Weights
```bash
curl http://localhost:8000/api/config/weights
```

#### Update Weights
```bash
curl -X PUT http://localhost:8000/api/config/weights \
  -H "Content-Type: application/json" \
  -d '{
    "harmonic": 0.15,
    "elliott": 0.15,
    "smc": 0.20,
    "fibonacci": 0.10,
    "price_action": 0.15,
    "sar": 0.10,
    "sentiment": 0.10,
    "news": 0.05,
    "whales": 0.05
  }'
```

#### List Presets
```bash
curl http://localhost:8000/api/config/weight-presets
```

#### Save Preset
```bash
curl -X POST "http://localhost:8000/api/config/weight-presets?name=my_preset" \
  -H "Content-Type: application/json" \
  -d '{
    "harmonic": 0.2,
    "elliott": 0.2,
    "smc": 0.15,
    "fibonacci": 0.1,
    "price_action": 0.15,
    "sar": 0.1,
    "sentiment": 0.05,
    "news": 0.03,
    "whales": 0.02
  }'
```

#### Delete Preset
```bash
curl -X DELETE http://localhost:8000/api/config/weight-presets/my_preset
```

## Troubleshooting

### Agent Not Starting

**Symptoms:** Agent toggle shows "OFF" and won't enable

**Checks:**
1. Check backend logs for errors
2. Verify scanner is initialized:
   ```bash
   curl http://localhost:8000/health | jq .
   ```
3. Check environment variables
4. Restart backend service

### WebSocket Not Connecting

**Symptoms:** WS badge shows "DISCONNECTED" or "ERROR"

**Checks:**
1. Verify WebSocket endpoint is accessible:
   ```bash
   wscat -c ws://localhost:8000/ws/realtime
   ```
2. Check CORS settings in `backend/main.py`
3. Verify `VITE_WS_URL` environment variable
4. Check browser console for errors
5. Verify firewall/proxy settings

### No Signal Updates

**Symptoms:** WebSocket connected but no messages received

**Checks:**
1. Verify agent is enabled:
   ```bash
   curl http://localhost:8000/api/agent/status
   ```
2. Check if symbols are subscribed:
   ```javascript
   ws.send(JSON.stringify({action: 'subscribe', symbols: ['BTCUSDT']}));
   ```
3. Check backend logs for scanner errors
4. Verify data providers are accessible

### High CPU/Memory Usage

**Symptoms:** System performance degraded

**Actions:**
1. Check metrics endpoint for connection count
2. Increase scan interval:
   ```bash
   curl -X PUT "http://localhost:8000/api/agent/config?scan_interval_ms=60000"
   ```
3. Reduce number of symbols being scanned
4. Check for memory leaks in logs
5. Restart services if necessary

### Backtest Failures

**Symptoms:** Backtest returns errors

**Checks:**
1. Verify date range is valid
2. Check if historical data is available for symbol
3. Verify initial capital is sufficient
4. Check backend logs for detailed error messages

## Performance Tuning

### Scan Interval

- Default: 30 seconds
- Recommended range: 10-120 seconds
- Lower = more frequent updates, higher CPU usage
- Higher = less frequent updates, lower CPU usage

```bash
curl -X PUT "http://localhost:8000/api/agent/config?scan_interval_ms=45000"
```

### WebSocket Connection Limits

Edit `backend/websocket/manager.py`:
```python
MAX_CONNECTIONS = 100  # Adjust based on server capacity
```

### Timeframes

- More timeframes = more accurate signals but slower scans
- Recommended: 2-4 timeframes (e.g., 15m, 1h, 4h)

### Symbol Selection

- Start with 5-10 symbols
- Add more as needed, monitoring system performance
- High-volume symbols require more resources

## Rollback Procedures

### Rolling Back Agent Changes

1. **Disable agent immediately:**
   ```bash
   curl -X PUT "http://localhost:8000/api/agent/toggle?enabled=false"
   ```

2. **Stop backend service:**
   ```bash
   # Development
   Ctrl+C in terminal
   
   # Production (systemd)
   sudo systemctl stop hts-backend
   ```

3. **Revert code changes:**
   ```bash
   git log --oneline  # Find previous stable commit
   git checkout <commit-hash>
   ```

4. **Restart services:**
   ```bash
   # Backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   
   # Or with systemd
   sudo systemctl start hts-backend
   ```

5. **Verify health:**
   ```bash
   curl http://localhost:8000/health
   ```

### Database Rollback (if using persistence)

```bash
# Restore from backup
psql -U user -d hts < backup_YYYYMMDD.sql

# Or use migration tools
alembic downgrade -1
```

### Emergency Stop

```bash
# Kill all processes
pkill -f "uvicorn main:app"
pkill -f "npm run dev"

# Or
sudo systemctl stop hts-backend hts-frontend
```

## Maintenance

### Daily Tasks

1. Check metrics endpoint for anomalies
2. Review error logs
3. Monitor WebSocket connection count
4. Verify agent is running if enabled

### Weekly Tasks

1. Review backtest performance
2. Analyze signal accuracy
3. Update weight presets based on performance
4. Check system resource usage trends

### Monthly Tasks

1. Update dependencies
2. Review and clean old logs
3. Optimize database (if used)
4. Performance benchmarking
5. Security audit

## Logs

### Backend Logs

**Location:** `backend/logs/` or stdout

**Important log entries:**
- `Real-time agent enabled/disabled`
- `Live scanner started/stopped`
- `WebSocket client connected/disconnected`
- `Scanner completed in X seconds`
- Any ERROR or WARNING messages

**Viewing logs:**
```bash
# Tail logs
tail -f backend/logs/app.log

# Search for errors
grep ERROR backend/logs/app.log

# Filter by component
grep "websocket" backend/logs/app.log
```

### Frontend Logs

**Location:** Browser console (F12)

**Important entries:**
- WebSocket connection status
- Agent toggle success/failure
- API call errors
- Performance warnings

## Acceptance Checklist

Before considering the integration complete, verify:

- [ ] Agent toggle in UI correctly flips backend state
- [ ] Toggling ON starts the live scanner (check logs)
- [ ] Toggling OFF stops the live scanner (check logs)
- [ ] WebSocket connects when agent is enabled
- [ ] WebSocket badge shows correct status
- [ ] Subscription messages work correctly
- [ ] Signal messages are received for subscribed symbols
- [ ] Manual scan via `/api/scanner/run` works
- [ ] Signal scoring via `/api/signals/score` works
- [ ] Backtest via `/api/backtest/run` returns results
- [ ] Risk endpoints return data
- [ ] Weight presets can be saved/loaded/deleted
- [ ] Metrics endpoint returns current stats
- [ ] Health check passes
- [ ] No console errors in browser
- [ ] No ERROR logs in backend (except expected errors)

## Support Contacts

- **System Administrator:** [Contact Info]
- **Backend Developer:** [Contact Info]
- **Frontend Developer:** [Contact Info]
- **On-Call:** [Contact Info]

## Additional Resources

- [API Documentation](./docs/api.md)
- [Architecture Diagram](./docs/architecture.png)
- [Scanner User Guide](./docs/SCANNER_USER_GUIDE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## Appendix

### API Endpoint Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/metrics` | GET | System metrics |
| `/api/agent/status` | GET | Agent status |
| `/api/agent/toggle` | PUT | Enable/disable agent |
| `/api/scanner/run` | POST | Manual scan |
| `/api/signals/score` | POST | Score single symbol |
| `/api/backtest/run` | POST | Run backtest |
| `/api/risk/status` | GET | Risk metrics |
| `/api/risk/calculate-position` | POST | Calculate position size |
| `/api/config/weights` | GET/PUT | Current weights |
| `/api/config/weight-presets` | GET/POST/DELETE | Manage presets |
| `/ws/realtime` | WebSocket | Real-time streaming |

### WebSocket Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `signal` | Server→Client | Signal update for symbol |
| `status` | Server→Client | System status |
| `error` | Server→Client | Error message |
| `pong` | Server→Client | Response to ping |
| `subscribe` | Client→Server | Subscribe to symbols |
| `unsubscribe` | Client→Server | Unsubscribe from symbols |
| `ping` | Client→Server | Keep-alive check |

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-05  
**Next Review:** 2025-11-05
