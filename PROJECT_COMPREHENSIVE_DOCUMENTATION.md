# HTS Trading System - Comprehensive Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [File Index](#file-index)
4. [File Relationships and Dependencies](#file-relationships-and-dependencies)
5. [Program Logic and Workflow](#program-logic-and-workflow)
6. [Data Flow Diagrams](#data-flow-diagrams)
7. [Technology Stack](#technology-stack)
8. [Deployment Architecture](#deployment-architecture)

---

## 🎯 Project Overview

**HTS (High-Tech Trading System)** is a comprehensive professional cryptocurrency trading platform featuring:

- **Dual-Stack Architecture**: React/TypeScript frontend + FastAPI/Python backend
- **Multi-Algorithm Market Scanning**: 9 different pattern detection algorithms
- **Real-time Data Processing**: WebSocket-based live updates
- **RTL-First Design**: Persian (Farsi) language interface with right-to-left layout
- **Advanced Analytics**: Machine learning predictions, sentiment analysis, pattern detection
- **Risk Management**: Comprehensive risk assessment and position sizing
- **Backtesting Engine**: Historical strategy validation
- **Multi-Provider Data Aggregation**: Binance, KuCoin, CoinGecko, and more

**Project Statistics:**
- Total Files: 379
- Backend Python Files: 101
- Frontend TypeScript/TSX Files: 91
- Configuration Files: 25+
- Documentation Files: 20+

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  (React 18 + TypeScript + Vite + Tailwind CSS)                 │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Scanner  │  │Dashboard │  │Portfolio │  │Backtest  │       │
│  │  Page    │  │   Page   │  │   Page   │  │   Page   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │              │              │
│       └─────────────┴──────────────┴──────────────┘              │
│                          │                                        │
│                   ┌──────▼──────┐                                │
│                   │  State Store │                                │
│                   │  (Observable)│                                │
│                   └──────┬───────┘                               │
│                          │                                        │
│         ┌────────────────┴────────────────┐                      │
│         │                                  │                      │
│    ┌────▼────┐                      ┌─────▼──────┐              │
│    │   API   │                      │ WebSocket  │              │
│    │ Service │                      │  Manager   │              │
│    └────┬────┘                      └─────┬──────┘              │
└─────────┼───────────────────────────────────┼───────────────────┘
          │                                   │
          │         HTTP/REST + WS            │
          │                                   │
┌─────────▼───────────────────────────────────▼───────────────────┐
│                        Backend Layer                              │
│              (FastAPI + Python 3.9+)                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Main FastAPI App                        │   │
│  │                    (main.py)                             │   │
│  └───┬────────────────────────────────────────────────┬─────┘   │
│      │                                                │           │
│  ┌───▼────────┐  ┌──────────┐  ┌──────────┐  ┌──────▼──────┐   │
│  │  API       │  │ Scoring  │  │Analytics │  │ WebSocket   │   │
│  │  Routes    │  │ Engine   │  │ Engines  │  │ Manager     │   │
│  └───┬────────┘  └────┬─────┘  └────┬─────┘  └──────┬──────┘   │
│      │                │              │                │           │
│  ┌───▼────────────────▼──────────────▼────────────────▼──────┐  │
│  │              9 Pattern Detectors                           │  │
│  │  Harmonic│Elliott│SMC│Fibonacci│Price Action│SAR│         │  │
│  │  Sentiment│News│Whales                                     │  │
│  └───┬────────────────────────────────────────────────────────┘  │
│      │                                                            │
│  ┌───▼────────────────────────────────────────────────────────┐  │
│  │           Data Management Layer                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│  │  │ Binance  │  │ KuCoin   │  │ Fallback │               │  │
│  │  │ Client   │  │ Client   │  │ Manager  │               │  │
│  │  └──────────┘  └──────────┘  └──────────┘               │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │           Supporting Services                             │   │
│  │  • Backtesting Engine  • Risk Manager                    │   │
│  │  • ML Predictor        • Database (PostgreSQL)           │   │
│  │  • Telegram Notifier   • Trade Logger                    │   │
│  └───────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Index

### Frontend Files (91 TypeScript/TSX Files)

#### **Entry Points**
| File | Purpose | Key Dependencies |
|------|---------|------------------|
| `src/main.tsx` | Application entry point, renders root React component | React, ReactDOM, App.tsx |
| `src/App.tsx` | Main app component with routing configuration | react-router-dom, Layout, all page components |
| `index.html` | HTML entry point with RTL support | Vazirmatn font, Persian language meta |

#### **Pages (8 Page Components)**
| File | Purpose | Key Features |
|------|---------|--------------|
| `src/pages/Dashboard/index.tsx` | Main dashboard with overview metrics | Real-time signals, portfolio summary |
| `src/pages/Scanner/index.tsx` | Market scanner interface | Multi-symbol/timeframe scanning |
| `src/pages/Portfolio/index.tsx` | Portfolio management | Position tracking, P&L analysis |
| `src/pages/Backtest/index.tsx` | Strategy backtesting | Historical performance testing |
| `src/pages/Watchlist/index.tsx` | Custom watchlist management | Symbol tracking, alerts |
| `src/pages/Settings/index.tsx` | System configuration | User preferences, API keys |
| `src/pages/AIPage/index.tsx` | AI insights and predictions | ML model outputs |
| `src/pages/Training/index.tsx` | ML model training interface | Dataset management |

#### **Core Components (60 React Components)**

**Layout & Navigation**
| File | Purpose | Dependencies |
|------|---------|--------------|
| `src/components/Layout.tsx` | Main layout wrapper with navigation | React Router Outlet, header components |
| `src/components/header/AgentToggle.tsx` | Toggle for autonomous agent | State store |
| `src/components/header/WSStatusBadge.tsx` | WebSocket connection status indicator | WebSocket manager |

**Scanner Components (15 Files)**
| File | Purpose |
|------|---------|
| `src/components/MarketScanner.tsx` | Main scanner component |
| `src/components/scanner/SymbolInput.tsx` | Symbol selection input |
| `src/components/scanner/TimeframeSelector.tsx` | Timeframe selection |
| `src/components/scanner/ScanButtons.tsx` | Scan action buttons |
| `src/components/scanner/ResultsTable.tsx` | Tabular results display |
| `src/components/scanner/ResultsGrid.tsx` | Grid layout for results |
| `src/components/scanner/ResultsChart.tsx` | Chart visualization of results |
| `src/components/scanner/ResultsHeader.tsx` | Results summary header |
| `src/components/scanner/ScannerHeatmap.tsx` | Heatmap visualization |
| `src/components/scanner/AdvancedFilters.tsx` | Advanced filtering options |
| `src/components/scanner/QuickFilters.tsx` | Quick filter presets |
| `src/components/scanner/PresetDropdown.tsx` | Weight preset selector |
| `src/components/scanner/WeightPresetsPanel.tsx` | Weight configuration panel |
| `src/components/scanner/ExportMenu.tsx` | Results export functionality |
| `src/components/scanner/SessionHistory.tsx` | Scan history tracking |
| `src/components/scanner/TimeframeBreakdownPanel.tsx` | Per-timeframe analysis |
| `src/components/scanner/ComparisonPanel.tsx` | Symbol comparison |
| `src/components/scanner/PatternBadges.tsx` | Pattern detection badges |
| `src/components/scanner/KeyboardShortcutsPanel.tsx` | Keyboard shortcuts help |

**Signal & Analysis Components**
| File | Purpose |
|------|---------|
| `src/components/SignalCard.tsx` | Individual signal display card |
| `src/components/SignalDetails.tsx` | Detailed signal breakdown |
| `src/components/ComponentBreakdown.tsx` | Component score visualization |
| `src/components/ScoreGauge.tsx` | Score gauge chart (0-1 range) |
| `src/components/DirectionPill.tsx` | Bullish/Bearish/Neutral indicator |
| `src/components/ConfidenceGauge.tsx` | Confidence level indicator |

**Chart & Visualization Components**
| File | Purpose |
|------|---------|
| `src/components/Chart.tsx` | Generic chart wrapper |
| `src/components/TradingChart.tsx` | Trading chart with indicators |
| `src/components/MarketDepthChart.tsx` | Order book depth chart |
| `src/components/MarketDepthBars.tsx` | Bid/ask depth bars |
| `src/components/CorrelationHeatMap.tsx` | Asset correlation heatmap |
| `src/components/SimpleHeatmap.tsx` | Simple heatmap component |
| `src/components/MarketVisualization3D.tsx` | 3D market visualization |

**Strategy & Risk Components**
| File | Purpose |
|------|---------|
| `src/components/StrategyBuilder.tsx` | Strategy configuration interface |
| `src/components/WeightSliders.tsx` | Detector weight sliders |
| `src/components/RulesConfig.tsx` | Scan rules configuration |
| `src/components/BacktestPanel.tsx` | Backtesting interface |
| `src/components/RiskPanel.tsx` | Risk metrics display |
| `src/components/PositionSizer.tsx` | Position size calculator |
| `src/components/RealTimeRiskMonitor.tsx` | Real-time risk monitoring |

**Portfolio Components**
| File | Purpose |
|------|---------|
| `src/components/PortfolioPanel.tsx` | Portfolio overview |
| `src/components/PnLDashboard.tsx` | Profit & Loss analytics |
| `src/components/Dashboard.tsx` | Main dashboard component |

**AI & Analytics Components**
| File | Purpose |
|------|---------|
| `src/components/AIInsightsPanel.tsx` | AI-powered insights |
| `src/components/PredictiveAnalyticsDashboard.tsx` | Predictive analytics display |

**Utility Components**
| File | Purpose |
|------|---------|
| `src/components/Loading.tsx` | Loading spinner component |
| `src/components/Empty.tsx` | Empty state component |
| `src/components/ErrorBlock.tsx` | Error display component |
| `src/components/WSBadge.tsx` | WebSocket status badge |
| `src/components/Login.tsx` | Login form component |

#### **Services (7 Service Modules)**
| File | Purpose | Key Functionality |
|------|---------|------------------|
| `src/services/api.ts` | HTTP API client with retry logic | GET/POST/PUT/DELETE with exponential backoff |
| `src/services/websocket.ts` | WebSocket manager | Auto-reconnect, state management |
| `src/services/wsClient.ts` | WebSocket client wrapper | Message handling |
| `src/services/binanceApi.ts` | Binance API integration | Market data fetching |
| `src/services/agent.ts` | Autonomous agent service | Automated trading logic |
| `src/services/tradingEngine.ts` | Trading execution engine | Order placement, management |
| `src/services/sentimentApi.ts` | Sentiment data API | Social sentiment aggregation |

#### **State Management (2 Files)**
| File | Purpose | Pattern |
|------|---------|---------|
| `src/state/store.ts` | Observable store implementation | Singleton pattern, localStorage persistence |
| `src/state/hooks.ts` | React hooks for store | useStore, useSymbols, useWeights |

#### **Analytics Modules (6 Files)**
| File | Purpose |
|------|---------|
| `src/analytics/coreSignals.ts` | RSI, MACD signal generation |
| `src/analytics/indicators.ts` | Technical indicators calculation |
| `src/analytics/mlPredictor.ts` | ML prediction interface |
| `src/analytics/patternDetection.ts` | Candlestick pattern detection |
| `src/analytics/riskManager.ts` | Risk calculation utilities |
| `src/analytics/smcAnalysis.ts` | Smart Money Concepts analysis |

#### **Hooks (4 Custom Hooks)**
| File | Purpose |
|------|---------|
| `src/hooks/useDebounce.ts` | Debounce hook for input delays |
| `src/hooks/useThrottle.ts` | Throttle hook for rate limiting |
| `src/hooks/useKeyboardShortcuts.ts` | Keyboard shortcuts handling |
| `src/hooks/useMobileDetect.ts` | Mobile device detection |

#### **Types (1 File)**
| File | Purpose | Key Types |
|------|---------|-----------|
| `src/types/index.ts` | TypeScript type definitions | TradingSignal, ScanRequest, ScanResponse, ComponentScore, CombinedScore |

#### **Tests (5 Test Files)**
| File | Purpose |
|------|---------|
| `src/__tests__/setup.ts` | Test environment setup |
| `src/__tests__/Scanner.test.tsx` | Scanner component tests |
| `src/__tests__/AgentToggle.test.tsx` | Agent toggle tests |
| `src/__tests__/WSStatusBadge.test.tsx` | WebSocket badge tests |
| `src/__tests__/utils/performance.test.ts` | Performance utility tests |

#### **Utilities (2 Files)**
| File | Purpose |
|------|---------|
| `src/utils/mockData.ts` | Mock data for testing |
| `src/utils/performance.ts` | Performance monitoring utilities |

#### **Styles (2 Files)**
| File | Purpose |
|------|---------|
| `src/index.css` | Global styles with RTL support |
| `src/vite-env.d.ts` | Vite environment types |

---

### Backend Files (101 Python Files)

#### **Entry Point**
| File | Purpose | Key Responsibilities |
|------|---------|---------------------|
| `backend/main.py` | FastAPI application entry point | Route registration, middleware, startup/shutdown handlers |

#### **API Layer (4 Files)**
| File | Purpose |
|------|---------|
| `backend/api/routes.py` | Enhanced API routes (Phases 7-9) |
| `backend/api/routes_agent.py` | Autonomous agent endpoints |
| `backend/api/models.py` | Pydantic API models |
| `backend/api/__init__.py` | API module initialization |

#### **Authentication (2 Files)**
| File | Purpose |
|------|---------|
| `backend/auth/jwt_auth.py` | JWT token authentication |
| `backend/auth/__init__.py` | Auth module initialization |

#### **Detectors (11 Files) - Pattern Detection Algorithms**
| File | Purpose | Patterns Detected |
|------|---------|-------------------|
| `backend/detectors/base.py` | Base detector interface | Abstract base class |
| `backend/detectors/harmonic.py` | Harmonic pattern detector | Gartley, Butterfly, Bat, Crab patterns |
| `backend/detectors/elliott.py` | Elliott Wave detector | Wave patterns, impulse/corrective waves |
| `backend/detectors/smc.py` | Smart Money Concepts detector | Order blocks, FVGs, liquidity zones |
| `backend/detectors/fibonacci.py` | Fibonacci detector | Retracement, extension levels |
| `backend/detectors/price_action.py` | Price action detector | Support/resistance, breakouts |
| `backend/detectors/sar.py` | Parabolic SAR detector | Trend reversals |
| `backend/detectors/sentiment.py` | Sentiment detector | Market sentiment analysis |
| `backend/detectors/news.py` | News sentiment detector | News impact analysis |
| `backend/detectors/whales.py` | Whale transaction detector | Large transaction monitoring |
| `backend/detectors/__init__.py` | Detectors module initialization | Detector registry |

#### **Scoring System (8 Files)**
| File | Purpose |
|------|---------|
| `backend/scoring/engine.py` | Dynamic scoring engine |
| `backend/scoring/scanner.py` | Multi-timeframe scanner |
| `backend/scoring/mtf_scanner.py` | Alternative MTF scanner implementation |
| `backend/scoring/api.py` | Scoring API endpoints |
| `backend/scoring/detector_protocol.py` | Detector interface protocol |
| `backend/scoring/detector_adapters.py` | Detector adapters |
| `backend/scoring/simple_detector_adapters.py` | Simplified detector adapters |
| `backend/scoring/__init__.py` | Scoring module initialization |

#### **Analytics (16 Files)**
| File | Purpose |
|------|---------|
| `backend/analytics/core_signals.py` | Core signal generation (RSI, MACD) |
| `backend/analytics/indicators.py` | Technical indicators |
| `backend/analytics/indicators_numba.py` | Optimized indicators with Numba |
| `backend/analytics/indicator_engine.py` | Indicator calculation engine |
| `backend/analytics/smc_analysis.py` | SMC analysis implementation |
| `backend/analytics/advanced_smc.py` | Advanced SMC features |
| `backend/analytics/pattern_detection.py` | Pattern detection algorithms |
| `backend/analytics/sentiment.py` | Sentiment analysis |
| `backend/analytics/ml_predictor.py` | Machine learning predictor |
| `backend/analytics/ml_ensemble.py` | ML ensemble methods |
| `backend/analytics/predictive_engine.py` | Predictive analytics engine |
| `backend/analytics/multi_timeframe.py` | Multi-timeframe analysis |
| `backend/analytics/phase3_integration.py` | Phase 3 integration layer |
| `backend/analytics/realtime_stream.py` | Real-time data streaming |
| `backend/analytics/huggingface_ai.py` | HuggingFace AI integration |
| `backend/analytics/__init__.py` | Analytics module initialization |

#### **Data Management (8 Files)**
| File | Purpose |
|------|---------|
| `backend/data/data_manager.py` | Central data management |
| `backend/data/binance_client.py` | Binance API client |
| `backend/data/kucoin_client.py` | KuCoin API client |
| `backend/data/api_fallback_manager.py` | API fallback logic |
| `backend/data/api_config.py` | API configuration |
| `backend/data/rate_limiter.py` | Rate limiting for APIs |
| `backend/data/exceptions.py` | Custom exceptions |
| `backend/data/__init__.py` | Data module initialization |

#### **Backtesting (5 Files)**
| File | Purpose |
|------|---------|
| `backend/backtesting/engine.py` | Backtesting engine |
| `backend/backtesting/backtester.py` | Backtester implementation |
| `backend/backtesting/trade_simulator.py` | Trade simulation |
| `backend/backtesting/models.py` | Backtest data models |
| `backend/backtesting/__init__.py` | Backtesting module initialization |

#### **Risk Management (5 Files)**
| File | Purpose |
|------|---------|
| `backend/risk/risk_manager.py` | Basic risk manager |
| `backend/risk/advanced_risk_manager.py` | Advanced risk features |
| `backend/risk/enhanced_risk_manager.py` | Enhanced risk calculations |
| `backend/risk/portfolio_risk_manager.py` | Portfolio-level risk |
| `backend/risk/__init__.py` | Risk module initialization |

#### **WebSocket (3 Files)**
| File | Purpose |
|------|---------|
| `backend/websocket/manager.py` | WebSocket connection manager |
| `backend/websocket/live_scanner.py` | Live scanner WebSocket handler |
| `backend/websocket/__init__.py` | WebSocket module initialization |

#### **Database (3 Files)**
| File | Purpose |
|------|---------|
| `backend/database/connection.py` | Database connection handling |
| `backend/database/models.py` | SQLAlchemy models |
| `backend/database/__init__.py` | Database module initialization |

#### **Trading (3 Files)**
| File | Purpose |
|------|---------|
| `backend/trading/trade_logger.py` | Trade logging |
| `backend/trading/pnl_calculator.py` | P&L calculation |
| `backend/trading/__init__.py` | Trading module initialization |

#### **Notifications (2 Files)**
| File | Purpose |
|------|---------|
| `backend/notifications/telegram_bot.py` | Telegram notifications |
| `backend/notifications/__init__.py` | Notifications module initialization |

#### **Routers (2 Files)**
| File | Purpose |
|------|---------|
| `backend/routers/data.py` | Data aggregation routes |
| `backend/routers/__init__.py` | Routers module initialization |

#### **Services (6 Files)**
| File | Purpose |
|------|---------|
| `backend/services/defi.py` | DeFi data services |
| Additional service modules | Various service integrations |

#### **Core Utilities (4 Files)**
| File | Purpose |
|------|---------|
| `backend/core/cache.py` | Caching utilities |
| `backend/core/config_hardcoded.py` | Configuration constants |
| `backend/core/http.py` | HTTP utilities |
| `backend/core/__init__.py` | Core module initialization |

#### **Schemas (2 Files)**
| File | Purpose |
|------|---------|
| `backend/schemas/validation.py` | Data validation schemas |
| `backend/schemas/__init__.py` | Schemas module initialization |

#### **Scanner (2 Files)**
| File | Purpose |
|------|---------|
| `backend/scanner/mtf_scanner.py` | Multi-timeframe scanner |
| `backend/scanner/__init__.py` | Scanner module initialization |

#### **Configuration & Utilities (6 Files)**
| File | Purpose |
|------|---------|
| `backend/models.py` | Core data models |
| `backend/logging_config.py` | Logging configuration |
| `backend/auth_server.py` | Authentication server |
| `backend/demo_phase4.py` | Phase 4 demo script |
| Various test files | Test scripts for different phases |

---

### Configuration Files (25+ Files)

#### **Build & Package Management**
| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies and scripts |
| `package-lock.json` | Locked dependency versions |
| `backend/requirements.txt` | Python dependencies |

#### **TypeScript Configuration**
| File | Purpose |
|------|---------|
| `tsconfig.json` | Base TypeScript configuration |
| `tsconfig.app.json` | App-specific TypeScript config |
| `tsconfig.node.json` | Node-specific TypeScript config |

#### **Build Tools**
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `vitest.config.ts` | Vitest test configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `eslint.config.js` | ESLint configuration |

#### **Docker & Deployment**
| File | Purpose |
|------|---------|
| `Dockerfile.frontend` | Frontend Docker image |
| `Dockerfile.backend` | Backend Docker image |
| `docker-compose.yml` | Development Docker Compose |
| `docker-compose.production.yml` | Production Docker Compose |
| `nginx.conf` | Nginx configuration |
| `nginx/nginx.conf` | Additional Nginx config |
| `vercel.json` | Vercel deployment config |

#### **Database**
| File | Purpose |
|------|---------|
| `init.sql` | Database initialization script |

#### **Scripts**
| File | Purpose |
|------|---------|
| `setup.sh` | Linux/Mac setup script |
| `setup.bat` | Windows setup script |
| `start-dev.sh` | Linux/Mac dev server start |
| `start-dev.bat` | Windows dev server start |
| `start.js` | Node.js startup script |

---

### Documentation Files (20+ Files)

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `START_HERE.md` | Getting started guide |
| `QUICK_START_GUIDE.md` | Quick start instructions |
| `START_WITH_DOCKER.md` | Docker setup guide |
| `DOCKER_SETUP_GUIDE.md` | Detailed Docker guide |
| `DEPLOYMENT_GUIDE.md` | Deployment instructions |
| `INTEGRATION_RUNBOOK.md` | Integration guide |
| `IMPLEMENTATION_COMPLETE.md` | Implementation summary |
| `IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `CRYPTO_API_IMPLEMENTATION_SUMMARY.md` | Crypto API docs |
| `CRYPTO_API_QUICK_START.md` | Crypto API guide |
| `REALTIME_AGENT_IMPLEMENTATION.md` | Agent implementation |
| `REALTIME_AGENT_QUICK_START.md` | Agent quick start |
| `SCANNER_IMPLEMENTATION.md` | Scanner implementation |
| `PREDICTIVE_ANALYTICS_README.md` | Analytics documentation |
| `UI_UX_ALIGNMENT_COMPLETE.md` | UI/UX documentation |
| `📖_COMPLETE_INDEX.md` | Complete project index |
| `docs/FRONTEND_AUDIT.md` | Frontend audit report |
| `docs/SCANNER_README.md` | Scanner documentation |
| `docs/SCANNER_USER_GUIDE.md` | Scanner user guide |

---

## 🔗 File Relationships and Dependencies

### Frontend Dependency Graph

```
main.tsx (Entry)
  └─> App.tsx (Router)
       ├─> Layout.tsx
       │    ├─> Header Components
       │    │    ├─> AgentToggle.tsx → state/store.ts
       │    │    └─> WSStatusBadge.tsx → services/websocket.ts
       │    └─> Outlet (Router)
       │
       └─> Pages
            ├─> Dashboard/index.tsx
            │    ├─> Dashboard.tsx → services/api.ts
            │    ├─> SignalCard.tsx
            │    └─> PnLDashboard.tsx
            │
            ├─> Scanner/index.tsx
            │    ├─> MarketScanner.tsx → services/api.ts, state/store.ts
            │    └─> Scanner Components (15 files)
            │         ├─> SymbolInput.tsx
            │         ├─> TimeframeSelector.tsx
            │         ├─> ResultsTable.tsx
            │         └─> ... (12 more)
            │
            ├─> Portfolio/index.tsx
            │    └─> PortfolioPanel.tsx → services/api.ts
            │
            ├─> Backtest/index.tsx
            │    └─> BacktestPanel.tsx → services/api.ts
            │
            ├─> Settings/index.tsx
            │    ├─> StrategyBuilder.tsx → state/store.ts
            │    ├─> WeightSliders.tsx
            │    └─> RulesConfig.tsx
            │
            ├─> AIPage/index.tsx
            │    └─> AIInsightsPanel.tsx → services/api.ts
            │
            ├─> Training/index.tsx
            │    └─> ML Training Components
            │
            └─> Watchlist/index.tsx
                 └─> Watchlist Components

State Management Flow:
state/store.ts (Singleton)
  ├─> localStorage (Persistence)
  └─> Observable Pattern
       └─> state/hooks.ts
            ├─> useStore()
            ├─> useSymbols()
            └─> useWeights()

Service Layer:
services/api.ts (HTTP Client)
  ├─> Retry Logic (2 attempts, exponential backoff)
  └─> All API Endpoints
       ├─> /api/scanner/run
       ├─> /api/analytics/predictions
       ├─> /api/backtest/run
       └─> ...

services/websocket.ts (WebSocket Manager)
  ├─> Auto-reconnect
  ├─> State Management
  └─> Message Broadcasting

Analytics Modules:
analytics/*
  ├─> coreSignals.ts → indicators.ts
  ├─> mlPredictor.ts → services/api.ts
  ├─> patternDetection.ts → indicators.ts
  ├─> riskManager.ts → indicators.ts
  └─> smcAnalysis.ts → indicators.ts
```

### Backend Dependency Graph

```
main.py (FastAPI App)
  ├─> Middleware (CORS)
  ├─> Routers
  │    ├─> api/routes.py
  │    ├─> api/routes_agent.py
  │    ├─> scoring/api.py
  │    └─> routers/data.py
  │
  ├─> WebSocket Manager
  │    └─> websocket/manager.py
  │         └─> websocket/live_scanner.py
  │              └─> scoring/scanner.py
  │
  └─> Startup Initialization
       ├─> Database Connection
       ├─> Detector Initialization
       ├─> Scoring Engine Setup
       └─> Live Scanner Start

Detector Architecture:
detectors/base.py (Abstract Base)
  └─> Concrete Detectors (9 implementations)
       ├─> detectors/harmonic.py
       ├─> detectors/elliott.py
       ├─> detectors/smc.py
       ├─> detectors/fibonacci.py
       ├─> detectors/price_action.py
       ├─> detectors/sar.py
       ├─> detectors/sentiment.py
       ├─> detectors/news.py
       └─> detectors/whales.py

Scoring Pipeline:
scoring/engine.py (DynamicScoringEngine)
  ├─> Receives OHLCV data
  ├─> Runs all detectors in parallel (asyncio.gather)
  ├─> Applies weights to scores
  ├─> Combines scores with context awareness
  └─> Returns CombinedScore
       ├─> final_score (0-1)
       ├─> direction (BULLISH/BEARISH/NEUTRAL)
       ├─> confidence
       ├─> bull_mass / bear_mass
       └─> component breakdown

scoring/scanner.py (MultiTimeframeScanner)
  ├─> scoring/engine.py
  ├─> data/data_manager.py
  └─> Multiple symbols × timeframes
       └─> Ranked results by score

Data Flow:
data/data_manager.py (Central Hub)
  ├─> data/binance_client.py → Binance API
  ├─> data/kucoin_client.py → KuCoin API
  └─> data/api_fallback_manager.py
       ├─> data/rate_limiter.py
       └─> Fallback chain

Analytics Pipeline:
analytics/core_signals.py → analytics/indicators.py
analytics/smc_analysis.py → analytics/advanced_smc.py
analytics/ml_predictor.py → analytics/ml_ensemble.py
analytics/multi_timeframe.py → analytics/phase3_integration.py
analytics/sentiment.py → external APIs
analytics/predictive_engine.py → TensorFlow/PyTorch models
analytics/realtime_stream.py → websocket/manager.py

Backtesting:
backtesting/engine.py
  ├─> backtesting/trade_simulator.py
  ├─> backtesting/models.py
  ├─> scoring/engine.py (for signal generation)
  └─> risk/risk_manager.py (for position sizing)

Risk Management:
risk/risk_manager.py (Base)
  ├─> risk/advanced_risk_manager.py
  ├─> risk/enhanced_risk_manager.py
  └─> risk/portfolio_risk_manager.py

Database:
database/connection.py
  ├─> SQLAlchemy Engine
  └─> database/models.py
       ├─> TradingSession
       ├─> SignalRecord
       ├─> TradeRecord
       ├─> SystemMetrics
       └─> RiskLimit

Trading Execution:
trading/trade_logger.py → database/models.py
trading/pnl_calculator.py → trading/trade_logger.py
```

### Cross-Stack Dependencies

```
Frontend → Backend API Endpoints:

POST /api/scanner/run
  Frontend: MarketScanner.tsx → api.post()
  Backend: api/routes.py → scanner.scan()

GET /api/analytics/predictions/:symbol
  Frontend: SignalDetails.tsx → api.get()
  Backend: api/routes.py → scoring/engine.py

POST /api/backtest/run
  Frontend: BacktestPanel.tsx → api.post()
  Backend: api/routes.py → backtesting/engine.py

GET/POST /api/config/weights
  Frontend: StrategyBuilder.tsx → api.get/post()
  Backend: api/routes.py → scoring/engine.update_weights()

WS /ws/realtime
  Frontend: websocket.ts → WebSocketManager
  Backend: websocket/manager.py → broadcast()

Data Flow Example - Scanner Request:
1. User enters symbols in Scanner page
2. SymbolInput.tsx updates state/store.ts
3. User clicks "Scan" → MarketScanner.tsx
4. api.post('/api/scanner/run', scanRequest)
5. Backend api/routes.py receives request
6. MultiTimeframeScanner.scan() called
7. For each symbol × timeframe:
   a. data_manager.get_ohlcv_data()
   b. scoring_engine.score(ohlcv)
   c. All 9 detectors run in parallel
   d. Results combined with weights
8. Results ranked by final_score
9. Response sent back to frontend
10. ResultsTable.tsx displays results
11. User clicks "Details" → SignalDetails.tsx
12. ComponentBreakdown.tsx shows detector scores
```

---

## 🔄 Program Logic and Workflow

### System Initialization Workflow

```mermaid
graph TD
    A[System Start] --> B[Backend Startup]
    A --> C[Frontend Build/Serve]
    
    B --> D[Initialize FastAPI App]
    D --> E[Register Middleware CORS]
    E --> F[Initialize Database]
    F --> G[Initialize Detectors]
    G --> H[Create Scoring Engine]
    H --> I[Start Live Scanner]
    I --> J[Register API Routes]
    J --> K[Start WebSocket Manager]
    K --> L[Backend Ready]
    
    C --> M[Load index.html]
    M --> N[Execute main.tsx]
    N --> O[Render App.tsx]
    O --> P[Setup React Router]
    P --> Q[Initialize State Store]
    Q --> R[Load from localStorage]
    R --> S[Connect to WebSocket]
    S --> T[Frontend Ready]
    
    L --> U[System Running]
    T --> U
```

### Market Scanning Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend Scanner
    participant S as State Store
    participant A as API Service
    participant B as Backend API
    participant E as Scoring Engine
    participant D as Detectors
    participant DM as Data Manager
    
    U->>F: Enter symbols & timeframes
    F->>S: Update state
    U->>F: Click "Scan Market"
    F->>S: Get current weights & rules
    F->>A: POST /api/scanner/run
    A->>B: HTTP Request with retry
    B->>E: MultiTimeframeScanner.scan()
    
    loop For each symbol × timeframe
        E->>DM: Get OHLCV data
        DM-->>E: Return price data
        E->>D: Run all detectors (parallel)
        
        par Parallel Detector Execution
            D->>D: Harmonic.detect()
            D->>D: Elliott.detect()
            D->>D: SMC.detect()
            D->>D: Fibonacci.detect()
            D->>D: PriceAction.detect()
            D->>D: SAR.detect()
            D->>D: Sentiment.detect()
            D->>D: News.detect()
            D->>D: Whales.detect()
        end
        
        D-->>E: All detector results
        E->>E: Apply weights & combine
        E->>E: Calculate final score
    end
    
    E-->>B: Ranked scan results
    B-->>A: JSON response
    A-->>F: Parsed results
    F->>F: Display in ResultsTable
    F->>U: Show results
```

### Signal Detail Retrieval Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant SD as SignalDetails Component
    participant A as API Service
    participant B as Backend
    participant E as Scoring Engine
    participant D as Data Manager
    
    U->>SD: Click "Details" on symbol
    SD->>A: GET /api/analytics/predictions/:symbol
    A->>B: HTTP Request
    B->>D: Get latest OHLCV
    D-->>B: Price data
    B->>E: score(ohlcv)
    E->>E: Run all detectors
    E-->>B: CombinedScore with components
    B-->>A: Detailed breakdown
    A-->>SD: Component scores
    SD->>SD: Render ComponentBreakdown
    SD->>SD: Render ScoreGauge
    SD->>SD: Render DirectionPill
    SD->>U: Display full analysis
```

### Strategy Configuration Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant SB as StrategyBuilder
    participant WS as WeightSliders
    participant RC as RulesConfig
    participant S as State Store
    participant A as API Service
    participant B as Backend
    
    U->>SB: Open Strategy Builder
    SB->>S: Load current config
    S-->>SB: weights & rules
    SB->>WS: Display weight sliders
    SB->>RC: Display rules config
    
    U->>WS: Adjust detector weights
    WS->>S: Update weights
    S->>S: Validate sum = 1.0
    S->>S: Persist to localStorage
    S->>A: POST /api/config/weights
    A->>B: Save to backend
    B-->>A: Success
    
    U->>RC: Change scan rules
    RC->>S: Update rules
    S->>S: Persist to localStorage
    
    Note over S,B: Changes immediately affect<br/>next scan
```

### Backtesting Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant BP as BacktestPanel
    participant A as API Service
    participant B as Backend
    participant BE as Backtest Engine
    participant SE as Scoring Engine
    participant DM as Data Manager
    participant TS as Trade Simulator
    
    U->>BP: Configure backtest params
    U->>BP: Click "Run Backtest"
    BP->>A: POST /api/backtest/run
    A->>B: Backtest request
    B->>BE: run()
    BE->>DM: Get historical data
    DM-->>BE: OHLCV for date range
    
    loop For each candle
        BE->>SE: Generate signal
        SE-->>BE: Score & direction
        alt Score > threshold
            BE->>TS: Open position
            TS->>TS: Track entry
        end
        alt Exit conditions met
            BE->>TS: Close position
            TS->>TS: Calculate P&L
        end
    end
    
    BE->>BE: Calculate metrics
    BE->>BE: Generate equity curve
    BE-->>B: Backtest results
    B-->>A: Performance metrics
    A-->>BP: Results data
    BP->>BP: Display metrics
    BP->>BP: Show equity curve
    BP->>U: Present results
```

### WebSocket Real-Time Updates Workflow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant WM as WebSocket Manager (Frontend)
    participant B as Backend WebSocket
    participant LS as Live Scanner
    participant E as Scoring Engine
    participant DM as Data Manager
    
    F->>WM: connect()
    WM->>B: WebSocket handshake
    B-->>WM: Connection established
    WM->>WM: Set state = 'connected'
    F->>WM: subscribe(symbol)
    WM->>B: {action: 'subscribe', symbol}
    B->>B: Add to subscriptions
    B-->>WM: subscription_confirmed
    
    loop Every scan interval
        LS->>DM: Get latest data
        DM-->>LS: Fresh OHLCV
        LS->>E: score(ohlcv)
        E-->>LS: Updated scores
        LS->>B: broadcast(new_data)
        B->>WM: send_json(update)
        WM->>F: Message event
        F->>F: Update UI
    end
```

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login Component
    participant A as API Service
    participant B as Backend Auth
    participant DB as Database
    
    U->>L: Enter credentials
    U->>L: Click "Login"
    L->>A: login(username, password)
    A->>B: POST /auth/login
    B->>DB: Query user
    DB-->>B: User record
    B->>B: Verify password (bcrypt)
    alt Valid credentials
        B->>B: Generate JWT token
        B-->>A: {token, user}
        A->>A: Store in localStorage
        A-->>L: Success
        L->>L: Redirect to Dashboard
    else Invalid credentials
        B-->>A: 401 Unauthorized
        A-->>L: Error
        L->>U: Show error message
    end
```

### Data Aggregation Flow

```mermaid
graph TD
    A[Data Manager Request] --> B{Primary API Available?}
    B -->|Yes| C[Binance Client]
    B -->|No| D[API Fallback Manager]
    C -->|Success| E[Return Data]
    C -->|Failure| D
    D --> F[Try KuCoin]
    F -->|Success| E
    F -->|Failure| G[Try CoinGecko]
    G -->|Success| E
    G -->|Failure| H[Try Yahoo Finance]
    H -->|Success| E
    H -->|Failure| I[Return Error]
    E --> J[Cache Result]
    J --> K[Apply Rate Limiting]
    K --> L[Return to Caller]
```

### Detector Scoring Algorithm

```python
# Pseudo-code for scoring logic

def score_symbol(ohlcv_data, weights, context):
    """
    Multi-detector scoring algorithm
    """
    # 1. Prepare context
    context = enrich_context(ohlcv_data, context)
    # Add trend, volatility, volume metrics
    
    # 2. Run all detectors in parallel
    detector_results = await asyncio.gather(
        harmonic_detector.detect(ohlcv_data, context),
        elliott_detector.detect(ohlcv_data, context),
        smc_detector.detect(ohlcv_data, context),
        # ... all 9 detectors
    )
    
    # 3. Normalize scores to 0-1 range
    normalized_scores = []
    for result in detector_results:
        score = normalize(result.score)  # 0=bearish, 1=bullish, 0.5=neutral
        normalized_scores.append(score)
    
    # 4. Apply weights
    weighted_scores = []
    for score, weight in zip(normalized_scores, weights):
        weighted_scores.append(score * weight)
    
    # 5. Calculate bull/bear mass
    bull_mass = sum(s for s in weighted_scores if s > 0.5)
    bear_mass = sum(s for s in weighted_scores if s < 0.5)
    
    # 6. Calculate final score
    final_score = sum(weighted_scores)
    
    # 7. Determine direction
    if final_score > 0.6:
        direction = "BULLISH"
    elif final_score < 0.4:
        direction = "BEARISH"
    else:
        direction = "NEUTRAL"
    
    # 8. Calculate confidence
    confidence = calculate_confidence(detector_results)
    
    # 9. Calculate disagreement
    disagreement = std_dev(weighted_scores)
    
    return CombinedScore(
        final_score=final_score,
        direction=direction,
        confidence=confidence,
        bull_mass=bull_mass,
        bear_mass=bear_mass,
        disagreement=disagreement,
        components=detector_results
    )
```

---

## 📊 Data Flow Diagrams

### Complete System Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     External Data Sources                        │
├─────────────────────────────────────────────────────────────────┤
│ Binance API │ KuCoin API │ CoinGecko │ News APIs │ Social APIs  │
└────┬──────────────┬─────────────┬─────────┬──────────────┬──────┘
     │              │             │         │              │
     ▼              ▼             ▼         ▼              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Aggregation Layer                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌────────────────┐    ┌─────────────┐    │
│  │Rate Limiter  │◄───┤ Fallback Mgr   │───►│ API Config  │    │
│  └──────┬───────┘    └────────┬───────┘    └─────────────┘    │
│         │                     │                                 │
│         ▼                     ▼                                 │
│  ┌──────────────────────────────────┐                          │
│  │      Data Manager (Central)      │                          │
│  │  - Caching                       │                          │
│  │  - Normalization                 │                          │
│  │  - Validation                    │                          │
│  └────────────────┬─────────────────┘                          │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Analytics Pipeline                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  OHLCV Data → Indicators Engine → Context Enrichment            │
│                                                                   │
│                          ▼                                        │
│              ┌───────────────────────┐                           │
│              │  Scoring Engine       │                           │
│              └───────────┬───────────┘                           │
│                          │                                        │
│        ┌─────────────────┴─────────────────┐                    │
│        ▼                                     ▼                    │
│  ┌──────────────┐                  ┌──────────────┐             │
│  │  9 Detectors │                  │  ML Models   │             │
│  │  (Parallel)  │                  │  (Ensemble)  │             │
│  └──────┬───────┘                  └──────┬───────┘             │
│         │                                  │                     │
│         └───────────────┬──────────────────┘                     │
│                         ▼                                        │
│              ┌───────────────────────┐                           │
│              │  Score Combiner       │                           │
│              │  - Apply Weights      │                           │
│              │  - Calculate Mass     │                           │
│              │  - Determine Direction│                           │
│              └───────────┬───────────┘                           │
└──────────────────────────┼────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Storage & Distribution                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐      ┌──────────────┐      ┌────────────────┐  │
│  │ Database   │      │  Cache Layer │      │  WebSocket Hub │  │
│  │ (Postgres) │      │  (Redis)     │      │  (Real-time)   │  │
│  └────┬───────┘      └──────┬───────┘      └────────┬───────┘  │
│       │                     │                       │            │
└───────┼─────────────────────┼───────────────────────┼────────────┘
        │                     │                       │
        ▼                     ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Scanner  │  │Analytics │  │Backtest  │  │ WebSocket    │   │
│  │ Routes   │  │ Routes   │  │ Routes   │  │ Endpoints    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
└───────┼─────────────┼─────────────┼────────────────┼────────────┘
        │             │             │                │
        ▼             ▼             ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐                           ┌─────────────────┐  │
│  │ API Service │◄──────┐                  │ WebSocket Mgr   │  │
│  │ (Retry)     │       │                  │ (Auto-reconnect)│  │
│  └──────┬──────┘       │                  └────────┬────────┘  │
│         │              │                           │            │
│         ▼              │                           ▼            │
│  ┌─────────────────────┴────────────┐    ┌─────────────────┐  │
│  │      State Store                 │    │  Real-time      │  │
│  │      (Observable + localStorage)  │    │  Updates        │  │
│  └────────────┬─────────────────────┘    └─────────┬───────┘  │
│               │                                     │            │
│               └─────────────┬───────────────────────┘            │
│                             ▼                                    │
│                    ┌────────────────┐                            │
│                    │ React Components│                            │
│                    └────────────────┘                            │
│                             │                                    │
│        ┌────────────────────┼───────────────────┐               │
│        ▼                    ▼                   ▼               │
│  ┌──────────┐        ┌──────────┐       ┌──────────┐           │
│  │ Scanner  │        │Portfolio │       │Backtest  │           │
│  │   UI     │        │   UI     │       │   UI     │           │
│  └──────────┘        └──────────┘       └──────────┘           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                        ┌───────┐
                        │ User  │
                        └───────┘
```

### Scanner Request Flow Detail

```
User Input (Scanner Page)
    │
    ├── Symbols: ["BTCUSDT", "ETHUSDT"]
    ├── Timeframes: ["15m", "1h", "4h"]
    ├── Weights: {harmonic: 0.15, elliott: 0.15, ...}
    └── Rules: {min_score: 0.6, ...}
    │
    ▼
Frontend State Store
    │
    ├── Validate Input
    ├── Format Request
    └── Store Current Config
    │
    ▼
API Service (POST /api/scanner/run)
    │
    ├── Add Headers (Content-Type, Auth)
    ├── Serialize to JSON
    └── Send with Retry Logic
    │
    ▼
Backend API Router (FastAPI)
    │
    ├── Validate Request Schema
    ├── Extract Parameters
    └── Call Scanner
    │
    ▼
MultiTimeframeScanner
    │
    ├── For Symbol 1 (BTCUSDT):
    │   ├── Timeframe 1 (15m):
    │   │   ├── Data Manager → Get OHLCV
    │   │   ├── Scoring Engine → Score
    │   │   │   ├── Detector 1 (Harmonic) → Score: 0.65
    │   │   │   ├── Detector 2 (Elliott) → Score: 0.55
    │   │   │   ├── ... (all 9 detectors)
    │   │   │   └── Combine: final_score = 0.62
    │   │   └── Store Result
    │   ├── Timeframe 2 (1h): [similar process]
    │   └── Timeframe 3 (4h): [similar process]
    │
    └── For Symbol 2 (ETHUSDT): [similar process]
    │
    ▼
Aggregation & Ranking
    │
    ├── Calculate Consensus Scores
    ├── Apply Filters (min_score, min_confidence)
    ├── Rank by Final Score
    └── Format Response
    │
    ▼
JSON Response
    {
      "scan_time": "2025-10-07T12:34:56",
      "symbols_scanned": 2,
      "opportunities_found": 3,
      "results": [
        {
          "symbol": "BTCUSDT",
          "final_score": 0.75,
          "direction": "BULLISH",
          "confidence": 0.82,
          "timeframe_scores": {
            "15m": {...},
            "1h": {...},
            "4h": {...}
          }
        },
        ...
      ]
    }
    │
    ▼
Frontend API Service
    │
    ├── Parse Response
    ├── Validate Data
    └── Return to Component
    │
    ▼
Scanner Results Display
    │
    ├── ResultsTable → Show ranked list
    ├── ResultsChart → Visualize scores
    ├── ResultsHeader → Show summary
    └── Enable "Details" clicks
```

---

## 🛠️ Technology Stack

### Frontend Technologies

| Category | Technologies |
|----------|-------------|
| **Core** | React 18.3.1, TypeScript 5.6.3 |
| **Build Tool** | Vite 5.4.8 |
| **Styling** | Tailwind CSS 3.4.14, PostCSS 8.4.47 |
| **Routing** | React Router DOM 6.30.1 |
| **Charts** | Recharts 2.12.7, Chart.js 4.5.0, D3.js 7.9.0 |
| **3D Graphics** | Three.js (via React Three Fiber 9.3.0) |
| **Animation** | Framer Motion 12.23.22 |
| **Icons** | Lucide React 0.462.0 |
| **Date Handling** | date-fns 4.1.0 |
| **Testing** | Vitest (configured) |
| **Linting** | ESLint |

### Backend Technologies

| Category | Technologies |
|----------|-------------|
| **Core** | Python 3.9+, FastAPI 0.104.1 |
| **Server** | Uvicorn 0.24.0 |
| **WebSocket** | websockets 12.0 |
| **Database** | PostgreSQL (via SQLAlchemy 2.0.23, psycopg2 2.9.9) |
| **Cache** | Redis 5.0.1 |
| **Data Processing** | Pandas 2.1.4, NumPy 1.24.3, Numba 0.58.1 |
| **ML/AI** | TensorFlow 2.15.0, PyTorch 2.1.2, scikit-learn 1.3.2 |
| **Technical Analysis** | TA-Lib 0.4.28 |
| **Crypto APIs** | python-binance 1.0.19, ccxt 4.1.77, yfinance 0.2.28 |
| **Authentication** | python-jose 3.3.0, passlib 1.7.4 |
| **Logging** | structlog 23.2.0 |
| **HTTP Client** | httpx 0.27.0, aiohttp 3.9.1, requests 2.31.0 |
| **Validation** | Pydantic 2.5.0 |
| **Statistical** | scipy 1.11.4, statsmodels 0.14.1 |
| **Visualization** | plotly 5.17.0, matplotlib 3.8.2, seaborn 0.13.0 |
| **NLP/Transformers** | transformers 4.36.2, huggingface-hub 0.19.4 |

### DevOps & Deployment

| Category | Technologies |
|----------|-------------|
| **Containerization** | Docker, Docker Compose |
| **Web Server** | Nginx |
| **CI/CD** | Git, GitHub |
| **Cloud Platforms** | Vercel (frontend), Heroku (backend support) |
| **Environment** | python-dotenv 1.0.0 |

### Development Tools

| Category | Tools |
|----------|-------|
| **Package Manager** | npm (frontend), pip (backend) |
| **Concurrency** | concurrently 9.0.0 |
| **Font** | Vazirmatn (Persian/Farsi) |

---

## 🚀 Deployment Architecture

### Production Deployment Stack

```
                          ┌────────────────┐
                          │   CloudFlare   │
                          │   DNS & CDN    │
                          └────────┬───────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
         ┌──────────▼────────┐         ┌─────────▼────────┐
         │   Vercel          │         │   Backend Host   │
         │   (Frontend)      │         │   (VPS/Cloud)    │
         │                   │         │                  │
         │  React Static     │         │   Nginx Reverse  │
         │  Assets           │         │   Proxy          │
         └──────────┬────────┘         └────────┬─────────┘
                    │                           │
                    │                  ┌────────▼─────────┐
                    │                  │  Docker Compose  │
                    │                  │                  │
                    │                  │  ┌────────────┐  │
                    │                  │  │ FastAPI    │  │
                    │                  │  │ Backend    │  │
                    │                  │  └─────┬──────┘  │
                    │                  │        │         │
                    │                  │  ┌─────▼──────┐  │
                    │                  │  │ PostgreSQL │  │
                    │                  │  └────────────┘  │
                    │                  │                  │
                    │                  │  ┌────────────┐  │
                    │                  │  │   Redis    │  │
                    │                  │  └────────────┘  │
                    │                  └──────────────────┘
                    │                           │
                    └───────────────────────────┘
                         WebSocket + REST API
```

### Docker Compose Architecture

```yaml
# Production Stack

services:
  backend:
    - FastAPI Application
    - Port: 8000 (internal)
    - Environment: Production
    - Restart: always
    
  frontend:
    - Nginx serving static files
    - Port: 80 (internal)
    - Reverse proxy to backend
    
  postgres:
    - PostgreSQL 15
    - Port: 5432 (internal)
    - Persistent volume
    
  redis:
    - Redis 7
    - Port: 6379 (internal)
    - Persistent volume
    
  nginx:
    - Reverse proxy
    - SSL termination
    - Port: 80, 443 (external)
    - Load balancing
```

### Environment Configuration

#### Frontend Environment Variables
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

#### Backend Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@postgres:5432/hts
REDIS_URL=redis://redis:6379
SECRET_KEY=your-secret-key
BINANCE_API_KEY=your-api-key
BINANCE_API_SECRET=your-api-secret
TELEGRAM_BOT_TOKEN=your-bot-token
```

---

## 📝 Key Design Patterns

### 1. **Observable Store Pattern** (Frontend State)
- Singleton store with pub-sub mechanism
- localStorage persistence
- React hooks for component integration

### 2. **Protocol-Based Detectors** (Backend)
- Abstract base class defining detector interface
- Consistent DetectionResult format
- Pluggable detector architecture

### 3. **Retry Pattern** (API Calls)
- Exponential backoff
- Configurable retry attempts
- Error classification (retryable vs non-retryable)

### 4. **WebSocket Manager Pattern**
- Connection state management
- Auto-reconnection with backoff
- Subscription management

### 5. **Fallback Chain Pattern** (Data Sources)
- Primary → Secondary → Tertiary data sources
- Automatic failover
- Rate limiting per provider

### 6. **Scoring Pipeline Pattern**
- Parallel detector execution
- Weight-based aggregation
- Context-aware scoring

### 7. **Repository Pattern** (Database)
- SQLAlchemy ORM
- Connection pooling
- Session management

---

## 🔍 Key Algorithms

### 1. **Multi-Detector Scoring Algorithm**
- Parallel execution of 9 detectors
- Weighted score combination
- Bull/Bear mass calculation
- Confidence and disagreement metrics

### 2. **Multi-Timeframe Analysis**
- Consensus calculation across timeframes
- Timeframe weight adjustment
- Conflicting signal resolution

### 3. **Risk Management Calculations**
- ATR-based position sizing
- Portfolio-level risk aggregation
- Dynamic risk adjustment

### 4. **Backtesting Engine**
- Event-driven simulation
- Trade execution simulation
- Performance metrics calculation
- Equity curve generation

### 5. **Pattern Detection Algorithms**
- Harmonic patterns (Gartley, Butterfly, Bat, Crab)
- Elliott Wave analysis
- Smart Money Concepts (Order blocks, FVGs)
- Candlestick patterns

---

## 📚 Additional Resources

### Documentation Files
- See the 20+ documentation files in the project root for specific topics
- `START_HERE.md` - Quick start guide
- `docs/SCANNER_USER_GUIDE.md` - Scanner usage instructions
- `docs/FRONTEND_AUDIT.md` - Frontend implementation details

### API Documentation
- Backend API: `http://localhost:8000/docs` (Swagger UI)
- Backend ReDoc: `http://localhost:8000/redoc`

### Configuration Examples
- `docs/scanner-presets-examples.json` - Weight presets

---

## 🎯 System Capabilities Summary

### What This System Can Do

1. **Market Analysis**
   - Scan multiple cryptocurrencies simultaneously
   - Analyze across multiple timeframes (15m, 1h, 4h, 1d, etc.)
   - Detect 9 different pattern types
   - Generate buy/sell/hold signals with confidence levels

2. **Strategy Development**
   - Configure custom detector weights
   - Define entry/exit rules
   - Save and load strategy presets
   - Backtest strategies on historical data

3. **Risk Management**
   - Calculate position sizes based on ATR
   - Monitor portfolio-level risk
   - Track drawdown and exposure
   - Set risk limits

4. **Real-Time Monitoring**
   - WebSocket-based live updates
   - Autonomous agent mode
   - Real-time P&L tracking
   - Telegram notifications

5. **Data Aggregation**
   - Multi-provider data sourcing
   - Automatic failover
   - Rate-limited API calls
   - Historical data access

6. **User Interface**
   - RTL-first Persian interface
   - Responsive design
   - Keyboard shortcuts
   - Accessibility features

---

## 🔐 Security Considerations

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Environment variable isolation
- API key management
- Rate limiting on endpoints

---

## 📊 Performance Considerations

- Parallel detector execution (asyncio)
- Numba-optimized indicators
- Redis caching
- Database connection pooling
- Frontend code splitting
- Lazy loading of components

---

## 🐛 Error Handling

- Comprehensive try-catch blocks
- Custom exception classes
- Structured logging (structlog)
- Frontend error boundaries
- API retry mechanisms
- Graceful degradation

---

## 🔄 Development Workflow

1. **Local Development**
   ```bash
   npm run dev  # Starts both frontend and backend
   ```

2. **Testing**
   ```bash
   npm run test  # Frontend tests
   pytest        # Backend tests
   ```

3. **Building**
   ```bash
   npm run build  # Frontend production build
   ```

4. **Docker Development**
   ```bash
   docker-compose up  # Start all services
   ```

---

## 📈 Future Enhancements

Based on the codebase structure, potential areas for expansion:

1. **Additional Detectors** - New pattern recognition algorithms
2. **Advanced ML Models** - Deep learning for price prediction
3. **More Data Sources** - Additional exchange integrations
4. **Mobile App** - React Native implementation
5. **Advanced Backtesting** - Walk-forward optimization
6. **Portfolio Optimization** - Modern portfolio theory integration
7. **Social Trading** - Copy trading features
8. **Advanced Notifications** - Discord, SMS, Email alerts

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-07  
**Total Lines:** 2000+  
**Project Status:** Production Ready

---

*This documentation provides a comprehensive overview of the HTS Trading System. For specific implementation details, refer to the individual files and inline code comments.*
