# HTS Trading System - Integration Runbook

## Overview
This runbook provides step-by-step instructions for deploying, operating, and troubleshooting the HTS Trading System.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Agent Operations](#agent-operations)
5. [Verification Commands](#verification-commands)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring](#monitoring)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements
- Node.js >= 18.x
- Python >= 3.10
- PostgreSQL (optional, for production)
- 4GB RAM minimum
- 10GB disk space

### Required Tools
```bash
# Check versions
node --version
npm --version
python3 --version
```

## Backend Setup

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration
Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL=sqlite:///./hts_trading.db

# API Keys (DO NOT COMMIT)
BINANCE_API_KEY=your_key_here
BINANCE_SECRET_KEY=your_secret_here
COINGECKO_API_KEY=your_key_here
TELEGRAM_BOT_TOKEN=your_token_here

# Agent Configuration
REALTIME_AGENT_ENABLED=true
REALTIME_SCAN_INTERVAL_MS=10000

# WebSocket
WS_PORT=8765
```

### 3. Start Backend
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Verify Backend:**
```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-05T...",
  "version": "1.0.0"
}
```

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Create `.env` file in root directory:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8765
```

### 3. Start Frontend
```bash
npm run frontend:dev
```

**Access Application:**
- Open browser to `http://localhost:5173`
- Default route redirects to `/dashboard`

## Agent Operations

### Enable Agent (via UI)
1. Navigate to dashboard
2. Click "Agent Toggle" button in header
3. Status should change from OFF → ON
4. WS Badge should show "CONNECTED"

### Enable Agent (via API)
```bash
curl -X PUT http://localhost:8000/api/agent/toggle?enabled=true
```

**Response:**
```json
{
  "enabled": true,
  "scan_interval_ms": 10000,
  "subscribed_symbols": []
}
```

### Disable Agent
```bash
curl -X PUT http://localhost:8000/api/agent/toggle?enabled=false
```

### Check Agent Status
```bash
curl http://localhost:8000/api/agent/status
```

### Subscribe to Symbols
```bash
curl -X POST http://localhost:8000/api/agent/subscribe \
  -H "Content-Type: application/json" \
  -d '{"symbols": ["BTCUSDT", "ETHUSDT"]}'
```

## Verification Commands

### 1. Backend Health Check
```bash
curl -sS http://localhost:8000/api/health
```

### 2. Agent Status Check
```bash
curl -sS http://localhost:8000/api/agent/status
```

### 3. Toggle Agent ON
```bash
curl -X PUT -sS http://localhost:8000/api/agent/toggle?enabled=true
```

### 4. Toggle Agent OFF
```bash
curl -X PUT -sS http://localhost:8000/api/agent/toggle?enabled=false
```

### 5. Run Scanner (REST)
```bash
curl -X POST -sS http://localhost:8000/api/scanner/run \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["BTCUSDT", "ETHUSDT"],
    "timeframes": ["15m", "1h", "4h", "1d"]
  }'
```

### 6. Get Risk Status
```bash
curl -sS http://localhost:8000/api/risk/status
```

### 7. Portfolio Assessment
```bash
curl -sS http://localhost:8000/api/risk/portfolio-assessment
```

### 8. Run Backtest
```bash
curl -X POST -sS http://localhost:8000/api/backtest/run \
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

### 9. WebSocket Quick Test
Open browser console and run:

```javascript
const ws = new WebSocket('ws://localhost:8765/ws/realtime');
ws.onopen = () => {
  console.log('WebSocket connected');
  ws.send(JSON.stringify({ 
    action: 'subscribe', 
    symbols: ['BTCUSDT', 'ETHUSDT'] 
  }));
};
ws.onmessage = (e) => {
  console.log('Received:', JSON.parse(e.data));
};
ws.onerror = (e) => console.error('WebSocket error:', e);
ws.onclose = () => console.log('WebSocket closed');
```

### 10. Get System Metrics
```bash
curl -sS http://localhost:8000/api/metrics
```

## Troubleshooting

### Backend Won't Start

**Issue:** `No module named uvicorn`

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

**Issue:** Port 8000 already in use

**Solution:**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn main:app --port 8001
```

### Frontend Build Errors

**Issue:** `Cannot find module 'react-router-dom'`

**Solution:**
```bash
npm install react-router-dom --legacy-peer-deps
```

**Issue:** CSS import errors

**Solution:**
Ensure `@import` statements are at the top of `src/index.css`

### WebSocket Connection Fails

**Symptoms:**
- WS Badge shows "DISCONNECTED" or "ERROR"
- No real-time updates

**Troubleshooting Steps:**

1. Check WebSocket server is running:
```bash
netstat -an | grep 8765
```

2. Check CORS settings in `backend/main.py`:
```python
allow_origins=["http://localhost:5173", ...]
```

3. Check browser console for WebSocket errors

4. Verify environment variables:
```bash
echo $VITE_WS_URL
```

### Agent Won't Enable

**Symptoms:**
- Toggle button doesn't change state
- Error messages in console

**Solutions:**

1. Check backend logs:
```bash
tail -f backend/logs/app.log
```

2. Verify agent endpoints are registered:
```bash
curl http://localhost:8000/api/agent/status
```

3. Check for errors in browser console

### Scanner Returns No Results

**Solutions:**

1. Verify data sources are accessible:
```bash
curl http://localhost:8000/api/data/ticker/BTCUSDT
```

2. Check scanner configuration:
```bash
curl http://localhost:8000/api/config/weights
```

3. Lower score thresholds in Settings page

## Monitoring

### Key Metrics Endpoint
```bash
curl http://localhost:8000/api/metrics
```

**Response:**
```json
{
  "ws_connections": 5,
  "scans_per_min": 12,
  "last_scan_latency_ms": 245,
  "active_symbols": 10,
  "uptime_seconds": 3600
}
```

### Health Checks

**Backend Health:**
```bash
watch -n 5 'curl -s http://localhost:8000/api/health | jq'
```

**WebSocket Status:**
Check WS Badge in UI header

### Log Files

**Backend Logs:**
```bash
tail -f backend/logs/app.log
tail -f backend/logs/scanner.log
tail -f backend/logs/websocket.log
```

**Frontend Console:**
Open browser DevTools → Console tab

### Performance Metrics

**Scan Latency:**
- Target: < 500ms per symbol
- Monitor: `/api/metrics` → `last_scan_latency_ms`

**WebSocket Throughput:**
- Target: < 100ms message latency
- Monitor: Browser DevTools → Network → WS tab

**Memory Usage:**
```bash
# Backend
ps aux | grep uvicorn

# Frontend
Chrome DevTools → Performance → Memory
```

## Rollback Procedures

### Quick Rollback (Agent Only)

1. **Disable Agent:**
```bash
curl -X PUT http://localhost:8000/api/agent/toggle?enabled=false
```

2. **Or set environment variable:**
```bash
export REALTIME_AGENT_ENABLED=false
# Restart backend
```

### Full Application Rollback

1. **Stop services:**
```bash
# Kill backend
pkill -f uvicorn

# Stop frontend dev server
# Press Ctrl+C in terminal
```

2. **Checkout previous version:**
```bash
git log --oneline  # Find commit hash
git checkout <previous-commit-hash>
```

3. **Rebuild and restart:**
```bash
# Backend
cd backend && pip install -r requirements.txt
python3 -m uvicorn main:app --port 8000 --reload &

# Frontend
npm install --legacy-peer-deps
npm run frontend:dev
```

### Database Rollback (if needed)

```bash
# Backup current database
cp backend/hts_trading.db backend/hts_trading_backup_$(date +%Y%m%d).db

# Restore from backup
cp backend/hts_trading_backup_YYYYMMDD.db backend/hts_trading.db
```

## Production Deployment

### Build for Production

**Frontend:**
```bash
npm run build
```

Output: `dist/` directory

**Backend:**
```bash
# Use gunicorn for production
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### Environment Variables (Production)

```env
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/hts_db
ENVIRONMENT=production
LOG_LEVEL=INFO
REALTIME_AGENT_ENABLED=true

# Frontend
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://ws.yourdomain.com
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/hts-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Security Checklist

- [ ] API keys stored in environment variables (not committed)
- [ ] CORS configured for production domains only
- [ ] HTTPS enabled in production
- [ ] WebSocket connections use WSS (secure)
- [ ] Rate limiting enabled on API endpoints
- [ ] Database credentials secured
- [ ] JWT tokens expire after reasonable time
- [ ] Input validation on all endpoints
- [ ] SQL injection protection enabled
- [ ] XSS protection headers set

## Contact & Support

For issues or questions:
- Check logs first (`backend/logs/`)
- Review this runbook
- Check GitHub issues
- Contact: support@yourdomain.com

---

**Last Updated:** 2025-10-05  
**Version:** 1.0.0
