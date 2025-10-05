# Frontend Audit - Phase 0 Baseline

**Date:** 2025-10-05  
**Branch:** cursor/refactor-ui-for-rtl-and-market-scanner-28ab  
**Objective:** Deep analysis of existing frontend architecture before RTL + Market Scanner implementation

---

## Executive Summary

The HTS Trading System currently has a **fully functional single-page dashboard** with direct access (no authentication), built with React + Vite + Tailwind CSS. The codebase is well-structured but **lacks RTL support**, has **inconsistent loading/error states**, and does **not yet implement the backend scanner API**. The current implementation uses client-side signal generation via a trading engine that bypasses the multi-algorithm backend strategy.

**Key Findings:**
- ✅ Direct-to-dashboard (no login screen) - CONFIRMED
- ❌ No RTL support (HTML lang="en", no dir attribute)
- ❌ No Persian/Farsi fonts configured
- ❌ Missing Market Scanner integration with backend `/api/scanner/run`
- ❌ Inconsistent loading/empty/error UI patterns
- ⚠️ `framer-motion` referenced in code but **NOT in package.json** (dependency gap)
- ⚠️ Environment variables use `REACT_APP_*` prefix but Vite requires `VITE_*`
- ✅ API and WebSocket services properly use `import.meta.env` with protocol-aware fallbacks

---

## 1. Repository Structure

### Frontend Root: `/workspace/src/`

```
src/
├── analytics/              # Client-side analysis modules (6 files)
│   ├── coreSignals.ts
│   ├── indicators.ts
│   ├── mlPredictor.ts
│   ├── patternDetection.ts
│   ├── riskManager.ts
│   └── smcAnalysis.ts
│
├── components/             # React components (15 files)
│   ├── AIInsightsPanel.tsx
│   ├── BacktestPanel.tsx
│   ├── Chart.tsx
│   ├── CorrelationHeatMap.tsx
│   ├── Dashboard.tsx              ⭐ Main entry component
│   ├── Login.tsx                  ⚠️ Exists but not used
│   ├── MarketDepthChart.tsx
│   ├── MarketVisualization3D.tsx
│   ├── PnLDashboard.tsx
│   ├── PortfolioPanel.tsx
│   ├── PredictiveAnalyticsDashboard.tsx
│   ├── RealTimeRiskMonitor.tsx
│   ├── RiskPanel.tsx
│   ├── SignalCard.tsx
│   └── TradingChart.tsx
│
├── services/               # API & data services (5 files)
│   ├── api.ts                     ✅ Uses VITE_API_URL
│   ├── binanceApi.ts
│   ├── sentimentApi.ts
│   ├── tradingEngine.ts           ⚠️ Client-side signal generation
│   └── websocket.ts               ✅ Uses VITE_WS_URL with protocol-aware fallback
│
├── types/
│   └── index.ts                   # TypeScript interfaces
│
├── App.tsx                        # Root component (renders Dashboard directly)
├── main.tsx                       # Entry point
├── index.css                      # Tailwind directives only
└── vite-env.d.ts
```

### Key Files

| File | Purpose | Status |
|------|---------|--------|
| `index.html` | HTML root | ❌ lang="en", no dir="rtl" |
| `src/App.tsx` | Root component | ✅ Direct Dashboard render, no auth |
| `src/components/Dashboard.tsx` | Main dashboard | ✅ Functional with tabbed UI |
| `src/services/api.ts` | HTTP client | ✅ Uses `VITE_API_URL`, JSON headers, error handling |
| `src/services/websocket.ts` | WS client | ✅ Auto-reconnect, protocol-aware |
| `src/services/tradingEngine.ts` | Signal generator | ⚠️ Client-side only, bypasses backend scanner |

---

## 2. RTL Status

### Current State: **NO RTL SUPPORT**

#### HTML Root (`index.html`)
```html
<html lang="en">  <!-- ❌ Should be lang="fa" -->
  <head>
    <!-- ❌ No Persian font CDN link -->
    <!-- ❌ No dir="rtl" attribute -->
```

#### Typography
- **No Persian/Farsi font** (e.g., Vazirmatn, Vazir, or IRANSans)
- Font stack defaults to system fonts
- No font CSS file or CDN import

#### Global Styles (`src/index.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
- **Minimal** (Tailwind directives only)
- No RTL-specific overrides
- No CSS custom properties for theme tokens

#### Tailwind Config (`tailwind.config.js`)
- ✅ Extended colors, animations, keyframes
- ❌ No RTL plugin
- ❌ No `direction: 'rtl'` in theme

### Gap Summary
1. HTML `lang` and `dir` attributes missing
2. Persian font not loaded
3. No RTL Tailwind utilities or plugins
4. Text-align, margins, paddings not RTL-aware

---

## 3. Environment Variables

### Current Setup (`.env.example`)
```bash
# ❌ Wrong prefix for Vite
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_WS_URL=wss://your-backend-url.herokuapp.com
```

### Actual Usage in Code
```typescript
// src/services/api.ts (✅ Correct)
const env = (import.meta as any).env?.VITE_API_URL as string | undefined;

// src/services/websocket.ts (✅ Correct)
const env = (import.meta as any).env?.VITE_WS_URL as string | undefined;
```

### Action Required
- Update `.env.example` to use `VITE_API_URL` and `VITE_WS_URL`
- Create `.env.development` and `.env.production` with correct prefixes
- Document in README

---

## 4. Routing & Authentication

### Current Behavior: ✅ **DIRECT TO DASHBOARD**

#### `src/main.tsx`
```tsx
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

#### `src/App.tsx`
```tsx
function App() {
  // Direct dashboard access - no authentication
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}
```

#### Unused Components
- `src/components/Login.tsx` exists but is **never imported or rendered**
- No auth guards, no token checks, no protected routes

### Verdict
✅ **Complies with requirement:** App opens directly to Dashboard with no login screen.

---

## 5. Services Architecture

### 5.1 API Service (`src/services/api.ts`)

#### Strengths
- ✅ Uses `VITE_API_URL` (or falls back to `window.location.origin`)
- ✅ Normalizes trailing slashes
- ✅ JSON headers
- ✅ Error handling with HTTP status and text
- ✅ Credentials: 'include' for cookies

#### Gaps
- ❌ **No retry logic** (requirement: 2 attempts with short backoff)
- ❌ No request timeout configuration
- ⚠️ Legacy `login`/`logout` methods still present (unused)

#### Recommended Enhancements
```typescript
// Add retry wrapper
async function requestWithRetry<T>(path: string, options: RequestInit, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      return await request<T>(path, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 500 * (i + 1))); // exponential backoff
    }
  }
}
```

### 5.2 WebSocket Service (`src/services/websocket.ts`)

#### Strengths
- ✅ Protocol-aware URL construction (`wss:` for `https:`, `ws:` for `http:`)
- ✅ Uses `VITE_WS_URL` with fallback to `window.location.host`
- ✅ Auto-reconnect on close event (1.5s delay)

#### Gaps
- ⚠️ No connection state tracking (connected/disconnected)
- ⚠️ No exponential backoff for reconnect attempts
- ⚠️ No max reconnect attempts limit

#### Recommended Enhancements
- Add a `WebSocketManager` class with state tracking
- Expose connection status observable for UI badge
- Implement exponential backoff with max retry cap

### 5.3 Trading Engine (`src/services/tradingEngine.ts`)

#### Current Behavior
- **Client-side signal generation** using local analytics modules
- Calls `binanceApi` directly for OHLCV and ticker data
- Implements **fixed scoring formula:**
  ```
  finalScore = 0.40*core + 0.25*smc + 0.20*pattern + 0.10*sentiment + 0.05*ml
  ```

#### Critical Issue: **BYPASSES BACKEND STRATEGY**
❌ Does **not** use backend endpoints:
- `/api/scanner/run` (multi-symbol, multi-timeframe)
- `/api/signals/score` (single symbol scoring)
- `/api/analytics/predictions/:symbol`

This violates the requirement: **"No client-side bypass of strategy; all via backend APIs"**

#### Action Required
- **Phase 3:** Replace `tradingEngine.generateSignal()` calls with `api.post('/api/scanner/run', ...)`
- Remove client-side scoring logic or keep as fallback only

---

## 6. Backend API Contract (Reference)

### Available Endpoints

#### 6.1 Market Scanner
```http
POST /api/scanner/run
Content-Type: application/json

{
  "symbols": ["BTCUSDT", "ETHUSDT"],
  "timeframes": ["15m", "1h", "4h"],
  "weights": {
    "harmonic": 0.15,
    "elliott": 0.15,
    "smc": 0.20,
    "fibonacci": 0.10,
    "price_action": 0.15,
    "sar": 0.10,
    "sentiment": 0.10,
    "news": 0.05,
    "whales": 0.05
  },
  "rules": {
    "min_score": 0.6,
    "min_confidence": 0.5,
    "max_risk_level": "MEDIUM"
  }
}
```

**Response Schema:**
```typescript
interface ScanResponse {
  scan_time: string;
  symbols_scanned: number;
  opportunities_found: number;
  results: Array<{
    symbol: string;
    overall_score: number;          // 0-1
    overall_direction: "BULLISH" | "BEARISH" | "NEUTRAL";
    recommended_action: string;
    risk_level: string;
    consensus_strength: number;
    timeframe_scores: {
      [tf: string]: {
        final_score: number;
        direction: "BULLISH" | "BEARISH" | "NEUTRAL";
        advice: string;
        confidence: number;
        components: Array<{
          detector: string;
          score: number;
          direction: string;
          confidence: number;
          meta: object;
        }>;
      };
    };
  }>;
}
```

#### 6.2 Weight Configuration
```http
GET /api/config/weights  → Returns current weights
POST /api/config/weights → Update weights (returns updated config)
```

#### 6.3 Analytics Endpoints (From Requirements)
```http
GET /api/analytics/predictions/:symbol
GET /api/analytics/correlations
GET /api/analytics/market-depth/:symbol
```

#### 6.4 WebSocket
```
/ws/realtime  → Live price updates, scanner alerts
```

---

## 7. Component Analysis

### 7.1 Dashboard (`src/components/Dashboard.tsx`)

#### Current Features
- ✅ Tabbed navigation (Signals, Portfolio, P&L, Backtest, Analytics, Notifications, API Status)
- ✅ Symbol selector + "Generate Signal" button
- ✅ Live price updates (polling every 3 seconds)
- ✅ Market overview table with 24h change, volume
- ✅ Connection status badge (WiFi icon)

#### Loading States
```tsx
{signals.length > 0 ? (
  signals.map(signal => <SignalCard ... />)
) : (
  <div className="text-center text-gray-400 py-12">
    <div className="text-4xl mb-4">📊</div>
    <p>No Active Signals</p>
  </div>
)}
```
✅ **Consistent empty state** for signals panel  
⚠️ No loading spinner during `generateSignal()` API call  
⚠️ No error block (only `alert()` on failure)

#### Missing Components
❌ **Market Scanner page/section** (requirement Phase 3)  
❌ **Signal Details page** (requirement Phase 4)  
❌ **Strategy Builder** (requirement Phase 5)

### 7.2 Existing Panels

| Component | Status | Notes |
|-----------|--------|-------|
| `SignalCard` | ✅ Functional | BUY/SELL pills, confidence display |
| `TradingChart` | ✅ Functional | Chart.js candlestick charts |
| `RiskPanel` | ✅ Functional | Risk metrics display |
| `PortfolioPanel` | ✅ Functional | Portfolio overview |
| `BacktestPanel` | ✅ Functional | Backtesting UI (local only) |
| `PnLDashboard` | ✅ Functional | P&L analytics |
| `PredictiveAnalyticsDashboard` | ✅ Functional | ML predictions panel |
| `CorrelationHeatMap` | ✅ Functional | Asset correlation matrix |
| `MarketDepthChart` | ✅ Functional | Order book visualization |

### 7.3 Loading/Empty/Error Patterns

#### Current Implementations

**Empty States:** ✅ Present in Dashboard signals panel  
**Loading States:** ⚠️ Inconsistent (some use spinner, some don't)  
**Error States:** ❌ **Missing** (uses `alert()` or console.error)

#### Recommendation
Create global micro-components:
```tsx
// src/components/Loading.tsx
export const Loading = ({ message = "Loading..." }) => (...)

// src/components/Empty.tsx
export const Empty = ({ icon, title, description }) => (...)

// src/components/ErrorBlock.tsx
export const ErrorBlock = ({ code, message, onRetry }) => (...)
```

---

## 8. State Management

### Current Approach: **Local useState**

All state managed via React's `useState` within `Dashboard.tsx`:
```tsx
const [signals, setSignals] = useState<TradingSignal[]>([]);
const [marketData, setMarketData] = useState<MarketData[]>([]);
const [chartData, setChartData] = useState<OHLCVData[]>([]);
const [selectedSymbol, setSelectedSymbol] = useState<string>('BTCUSDT');
const [isConnected, setIsConnected] = useState<boolean>(true);
// ... etc
```

### Gaps
❌ **No global state store** (requirement: light observable store)  
❌ No centralized symbols, timeframes, weights, rules configuration  
❌ Scanner settings scattered across components

### Requirement (Phase 2)
Create `src/state/store.ts`:
```typescript
interface AppState {
  symbols: string[];            // default: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT']
  timeframes: string[];         // default: ['15m', '1h', '4h']
  weights: WeightConfig;
  rules: {
    any_tf: number;             // e.g., 0.6
    majority_tf: number;        // e.g., 0.7
    mode: 'aggressive' | 'conservative';
  };
}
```

Recommended library: **Zustand** (lightweight) or vanilla observable pattern.

---

## 9. Styling & Theme

### Current Stack
- **Tailwind CSS** (v3.4.14) ✅
- Utility-first approach
- Custom animations in `tailwind.config.js`

### Global Tokens (`tailwind.config.js`)
```javascript
extend: {
  colors: {
    slate: { 850: '#1e293b', 950: '#020617' }
  },
  animation: {
    'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'fade-in': 'fadeIn 0.5s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-out'
  }
}
```

### Design System
✅ **Consistent glassy cards:** `bg-gray-800/30 backdrop-blur-lg rounded-2xl`  
✅ **Gradient buttons:** `bg-gradient-to-r from-cyan-500 to-blue-600`  
✅ **Accessible color contrast** for text (mostly)

### Gaps for RTL
❌ No `text-right` / `text-left` direction utilities  
❌ Hardcoded `space-x-*` (should be `space-x-* rtl:space-x-reverse`)  
❌ Icons positioned with absolute left/right (need RTL-aware classes)

---

## 10. Dependencies Analysis

### Installed (`package.json`)
```json
{
  "dependencies": {
    "chart.js": "^4.5.0",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.462.0",     // ✅ Icon library
    "react": "^18.3.1",
    "react-chartjs-2": "^5.3.0",
    "react-dom": "^18.3.1",
    "recharts": "^2.12.7"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.8"
  }
}
```

### Missing but Referenced
❌ **`framer-motion`** (used in 3 files but NOT in package.json)  
❌ **`d3`** (used in CorrelationHeatMap.tsx but NOT in package.json)

Files importing missing dependencies:
```
# framer-motion
./src/components/AIInsightsPanel.tsx

# d3
./src/components/CorrelationHeatMap.tsx
```

**Note:** The files in `hts-trading-system/frontend/` appear to be an old version; the active codebase is under `/workspace/src/`.

### Compilation Status
⚠️ **TypeScript errors present** (pre-existing issues):
- Missing `framer-motion` and `d3` dependencies
- Unused variable declarations
- Type safety issues in Chart.tsx and CorrelationHeatMap.tsx

These do NOT block development but should be addressed during Phase 7 (Polish).

### Action Required
- **Phase 1:** Either:
  1. Add missing dependencies: `npm install framer-motion d3 @types/d3`, OR
  2. Replace framer-motion usage with CSS animations (preferred per prompt: "CSS first")
  3. Fix TypeScript errors during Phase 7 cleanup

---

## 11. Testing & Docs

### Current State
❌ **No test files found** (no `*.test.ts`, `*.spec.ts`)  
❌ **No E2E setup** (no Playwright/Cypress config)  
✅ README exists with basic setup instructions

### Required for Phase 8
- Unit tests for store (weights/rules updates)
- Component tests for Scanner (loading/error/success)
- E2E test: "Scan happy path → opens Signal Details"
- Updated README with env, routes, feature snapshots

---

## 12. Critical Gaps Summary

### High Priority (Blocks Phase 3)
1. ❌ **No Market Scanner component** wired to `/api/scanner/run`
2. ❌ **No Signal Details page** (`/signal/:symbol`)
3. ❌ **Client-side signal generation** bypasses backend strategy
4. ❌ **No observable store** for symbols/timeframes/weights/rules

### Medium Priority (Required for RTL + Polish)
5. ❌ **No RTL support** (HTML lang/dir, font, Tailwind config)
6. ⚠️ **Inconsistent loading/empty/error states**
7. ⚠️ **No retry logic** in API client
8. ⚠️ **framer-motion** dependency missing from package.json

### Low Priority (Nice to Have)
9. ❌ **No tests** (unit, component, E2E)
10. ⚠️ Legacy `Login.tsx` component unused (can be removed)

---

## 13. Backend Endpoints Mapping

| Requirement | Backend Endpoint | Frontend Status | Phase |
|-------------|------------------|-----------------|-------|
| Market Scanner | `POST /api/scanner/run` | ❌ Not wired | 3 |
| Signal Details | `GET /api/analytics/predictions/:symbol` | ❌ Not wired | 4 |
| Correlations | `GET /api/analytics/correlations` | ⚠️ Component exists, not wired | 4 |
| Market Depth | `GET /api/analytics/market-depth/:symbol` | ⚠️ Component exists, not wired | 4 |
| Weight Config | `GET/POST /api/config/weights` | ❌ Not wired | 5 |
| Backtest | `POST /api/backtest/run` | ⚠️ UI exists, not wired | 6 |
| Live Scanner WS | `/ws/realtime` | ⚠️ Service exists, not used | 3 |

---

## 14. Recommendations for Phase 1

### Immediate Actions (Phase 1 - Foundation)

1. **RTL Setup**
   ```html
   <!-- index.html -->
   <html lang="fa" dir="rtl">
     <head>
       <link rel="preconnect" href="https://fonts.googleapis.com">
       <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet">
   ```

2. **Global Font & Theme**
   ```css
   /* index.css */
   @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
   
   body {
     font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
   }
   ```

3. **Update Env Example**
   ```bash
   # .env.example
   VITE_API_URL=http://localhost:8000
   VITE_WS_URL=ws://localhost:8000
   ```

4. **Create Global State Components**
   ```bash
   src/components/Loading.tsx
   src/components/Empty.tsx
   src/components/ErrorBlock.tsx
   src/components/WSBadge.tsx  # WebSocket status indicator
   ```

5. **Add WS Status Badge to Header**
   - Show connected/disconnected state
   - Auto-reconnect on disconnect
   - Visual indicator (green=connected, red=disconnected, yellow=reconnecting)

---

## 15. Phase Checklist

### Phase 0 ✅ COMPLETED
- [x] Inventory all frontend folders
- [x] Check dependencies (found `framer-motion` gap)
- [x] Verify API/WS services (✅ use VITE_* env vars)
- [x] Confirm routing (✅ direct to Dashboard)
- [x] Create FRONTEND_AUDIT.md

### Phase 1 (Next)
- [ ] Set `lang="fa" dir="rtl"` in index.html
- [ ] Load Persian font (Vazirmatn)
- [ ] Create global Loading/Empty/Error components
- [ ] Add WSBadge component
- [ ] Update App shell with RTL-aware header
- [ ] PR: `feat(ui): rtl shell, font, ws badge, global states`

### Phase 2
- [ ] Add retry logic to api.ts
- [ ] Create observable store (symbols, timeframes, weights, rules)
- [ ] Update websocket.ts with state tracking
- [ ] PR: `feat(core): stable api/ws clients and observable store`

### Phase 3 ⭐ CRITICAL ✅ COMPLETED
- [x] Create Market Scanner component
- [x] Wire to `POST /api/scanner/run`
- [x] ScoreGauge, DirectionPill components
- [x] Replace client-side tradingEngine with backend API
- [x] PR: `feat(scanner): multi-timeframe market scanner wired to backend`

### Phase 4
- [ ] Signal Details page (`/signal/:symbol`)
- [ ] Wire to `/api/analytics/predictions/:symbol`, `/correlations`, `/market-depth/:symbol`
- [ ] Component breakdown cards
- [ ] PR: `feat(signal): details page with components and correlation`

### Phase 5
- [ ] Strategy Builder page with weight sliders
- [ ] Wire to `GET/POST /api/config/weights`
- [ ] PR: `feat(strategy): builder page with sliders and knobs`

### Phase 6
- [ ] Backtest & Risk UI wiring
- [ ] PR: `feat(ops): backtest and risk skeletons`

### Phase 7
- [ ] Consistency, A11y, responsive polish
- [ ] PR: `chore(ui): accessible states, contrast, responsive polish`

### Phase 8
- [ ] Tests (unit, component, E2E)
- [ ] Update README
- [ ] PR: `test(ui): scanner and details tests + docs`

---

## 16. File Paths Reference (Quick Copy)

```
/workspace/src/App.tsx
/workspace/src/main.tsx
/workspace/src/index.css
/workspace/src/components/Dashboard.tsx
/workspace/src/services/api.ts
/workspace/src/services/websocket.ts
/workspace/src/services/tradingEngine.ts
/workspace/src/types/index.ts
/workspace/index.html
/workspace/tailwind.config.js
/workspace/package.json
/workspace/.env.example
/workspace/backend/api/routes.py (backend reference)
/workspace/backend/api/models.py (backend reference)
```

---

## 17. Conclusion

The HTS Trading System has a **solid foundation** with a functional dashboard, proper API/WS services, and a well-organized component structure. However, it **does not yet implement the backend scanner strategy** and lacks **RTL support**.

**Next Steps:**
1. Execute **Phase 1** (RTL foundation, global components, WS badge)
2. Execute **Phase 2** (observable store, API enhancements)
3. Execute **Phase 3** (Market Scanner - THE CORE DELIVERABLE)
4. Continue through Phases 4-8 as per master prompt

**Estimated Complexity:**
- Phase 1-2: ~2-3 hours (foundation)
- Phase 3: ~4-6 hours (scanner + backend integration)
- Phase 4-5: ~4-5 hours (details + strategy builder)
- Phase 6-8: ~3-4 hours (polish + tests)

**Total:** ~13-18 hours for full implementation

---

**Audit Completed:** 2025-10-05  
**Author:** Cursor Agent  
**Status:** Ready to proceed to Phase 1
