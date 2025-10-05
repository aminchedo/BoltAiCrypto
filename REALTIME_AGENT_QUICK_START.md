# Real-Time Agent - Quick Start Guide 🚀

## 📋 Prerequisites

- Node.js >= 18
- Python >= 3.10
- Backend dependencies installed (`pip install -r backend/requirements.txt`)
- Frontend dependencies installed (`npm install`)

## 🏃 Quick Start (3 Steps)

### 1. Configure Environment (Optional)

```bash
# Copy example environment file
cp .env.example .env

# Edit if needed (defaults work for development)
nano .env
```

**Default Values:**
```env
REALTIME_AGENT_ENABLED=true
REALTIME_SCAN_INTERVAL_MS=1000
API_PORT=8000
WEBSOCKET_PORT=8765
```

### 2. Start Backend

```bash
# From project root
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or use npm script from root
npm run backend:dev
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
INFO:     Enhanced trading system components initialized
```

### 3. Start Frontend

```bash
# From project root (new terminal)
npm run dev

# Or
npm run frontend:dev
```

**Expected Output:**
```
  VITE v5.4.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🎮 Using the Real-Time Agent

### Enable Agent

1. Open browser: http://localhost:5173
2. Look for **"Agent: OFF"** button in header
3. Click to toggle → **"Agent: ON"** (green)
4. WebSocket badge shows **"WS: CONNECTED"** (green)

### View Real-Time Updates

- Dashboard automatically receives updates
- No page refresh needed
- Signals update in real-time

### Manual Scan

1. Click **"🔍 اسکنر جامع"** tab
2. Select symbols and timeframes
3. Click **"Run Scan Now"**
4. Results populate instantly

### Disable Agent

1. Click **"Agent: ON"** button
2. Turns to **"Agent: OFF"** (gray)
3. WebSocket disconnects
4. Manual scans still work

## 🔧 Troubleshooting

### WebSocket Won't Connect

**Problem**: Badge shows "WS: DISCONNECTED" or "WS: ERROR"

**Solutions**:
```bash
# 1. Check backend is running
curl http://localhost:8000/api/health

# 2. Check WebSocket endpoint
curl http://localhost:8000/api/agent/status

# 3. Check CORS settings
# In backend/main.py, ensure localhost:5173 is in allow_origins
```

### Agent Toggle Not Working

**Problem**: Button doesn't change state

**Solutions**:
```bash
# 1. Test API endpoint directly
curl http://localhost:8000/api/agent/status

# 2. Test toggle endpoint
curl -X PUT "http://localhost:8000/api/agent/toggle?enabled=true"

# 3. Check browser console for errors (F12)
```

### Build Errors

**Problem**: `npm run build` fails

**Solutions**:
```bash
# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 2. Check TypeScript errors
npm run frontend:build:check

# 3. Clear build cache
rm -rf dist
npm run build
```

### Backend Import Errors

**Problem**: "ModuleNotFoundError: No module named 'fastapi'"

**Solutions**:
```bash
# 1. Install backend dependencies
cd backend
pip install -r requirements.txt

# 2. Or use virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 📊 Testing the Implementation

### Backend Health Check

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Expected: {"status":"healthy",...}
```

### Agent Endpoints

```bash
# Get agent status
curl http://localhost:8000/api/agent/status
# Expected: {"enabled":true,"scan_interval_ms":1000,"subscribed_symbols":[]}

# Enable agent
curl -X PUT "http://localhost:8000/api/agent/toggle?enabled=true"
# Expected: {"enabled":true,...}

# Disable agent
curl -X PUT "http://localhost:8000/api/agent/toggle?enabled=false"
# Expected: {"enabled":false,...}

# Get config
curl http://localhost:8000/api/agent/config
# Expected: {"scan_interval_ms":1000,"max_symbols":50,...}
```

### WebSocket Test (Browser Console)

Open browser console (F12) and run:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8765/ws/realtime');

// Handle connection open
ws.onopen = () => {
  console.log('WebSocket connected!');
  
  // Subscribe to symbols
  ws.send(JSON.stringify({
    action: 'subscribe',
    symbols: ['BTCUSDT', 'ETHUSDT']
  }));
};

// Handle messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Handle errors
ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

// Handle close
ws.onclose = () => {
  console.log('WebSocket closed');
};
```

### Manual Scanner Test

```bash
# Test scanner endpoint
curl -X POST http://localhost:8000/api/scanner/run \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["BTCUSDT", "ETHUSDT"],
    "timeframes": ["15m", "1h", "4h"]
  }'

# Expected: {"scan_time":"...","results":[...]}
```

## 🐛 Common Issues

### Port Already in Use

```bash
# Backend port 8000 in use
lsof -ti:8000 | xargs kill -9

# Frontend port 5173 in use
lsof -ti:5173 | xargs kill -9

# WebSocket port 8765 in use
lsof -ti:8765 | xargs kill -9
```

### CORS Errors

If you see CORS errors in browser console:

1. Check `backend/main.py` CORS settings:
```python
allow_origins=[
    "http://localhost:5173",  # ← Must include this
    ...
]
```

2. Restart backend after changes

### React Hooks Warnings

If you see "Invalid hook call" warnings:

```bash
# Ensure single React instance
npm dedupe react react-dom
```

## 📱 Keyboard Shortcuts

Once in Scanner page:

- `Ctrl+S` - Run deep scan
- `Ctrl+Q` - Run quick scan
- `1` - List view
- `2` - Grid view
- `3` - Chart view
- `4` - Heatmap view
- `?` - Show shortcuts panel

## 🎨 UI Components Reference

### AgentToggle
**Location**: Dashboard header  
**Purpose**: Enable/disable real-time agent  
**States**: OFF (gray) → ON (green)

### WSStatusBadge
**Location**: Dashboard header (next to toggle)  
**Purpose**: Show WebSocket connection status  
**States**: 
- CONNECTING (yellow, spinning)
- CONNECTED (green)
- DISCONNECTED (gray)
- RECONNECTING (orange, spinning)
- ERROR (red)

### Scanner
**Location**: Main dashboard tab  
**Purpose**: Manual and automated market scanning  
**Features**: Multi-symbol, multi-timeframe, filters

## 📚 Next Steps

1. **Customize Watchlist**: Edit `symbols` array in Dashboard.tsx
2. **Adjust Scan Interval**: Modify REALTIME_SCAN_INTERVAL_MS in .env
3. **Add More Strategies**: Extend scanner/scoring logic
4. **Setup Notifications**: Configure Telegram bot in .env
5. **Deploy**: Follow DEPLOYMENT_GUIDE.md

## 🆘 Getting Help

- Check `REALTIME_AGENT_IMPLEMENTATION.md` for detailed docs
- Review console logs (F12 in browser)
- Check backend logs in terminal
- Test API endpoints with curl
- Verify all dependencies installed

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Backend starts without errors
- ✅ Frontend loads at localhost:5173
- ✅ Agent toggle button appears in header
- ✅ Toggle changes from OFF to ON
- ✅ WS badge shows CONNECTED (green)
- ✅ Manual scan returns results
- ✅ No console errors (F12)

---

**Need more help?** Check the main documentation in `REALTIME_AGENT_IMPLEMENTATION.md`
