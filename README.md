# HTS (Hybrid Trading System)

A complete cryptocurrency trading system with real-time data analysis, technical indicators, and automated signal generation.

## Features

### Core Algorithm (IMMUTABLE)
The system uses this exact scoring formula:
```
final_score = 0.40 * rsi_macd_score + 0.25 * smc_score + 0.20 * pattern_score + 0.10 * sentiment_score + 0.05 * ml_score
```

### Components
- **RSI + MACD Analysis (40%)**: Core technical indicators for trend and momentum
- **Smart Money Concepts (25%)**: Order blocks, liquidity zones, fair value gaps
- **Pattern Detection (20%)**: Candlestick patterns (Doji, Hammer, Engulfing, Pin Bar)
- **Sentiment Analysis (10%)**: Fear & Greed Index, market sentiment
- **ML Prediction (5%)**: Machine learning price direction prediction

### Technical Features
- Real-time data from Binance API
- WebSocket connections for live updates
- Risk management with position sizing
- Professional trading dashboard
- Comprehensive technical analysis
- Docker deployment ready

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd hts-trading-system

# Start the system
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Local Development

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

#### Frontend Setup
```bash
npm install
npm start
```

## API Endpoints

### Core Endpoints
- `GET /health` - System health check
- `POST /api/signals/generate` - Generate trading signal
- `GET /api/signals/live` - Get active signals
- `GET /api/analysis/{symbol}` - Detailed analysis
- `GET /api/price/{symbol}` - Current price
- `GET /api/ohlcv/{symbol}` - OHLCV data

### WebSocket Endpoints
- `ws://localhost:8000/ws/signals` - Live signal updates
- `ws://localhost:8000/ws/prices` - Real-time price updates

## Usage

### Generate a Trading Signal
```bash
curl -X POST "http://localhost:8000/api/signals/generate" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT", "interval": "1h"}'
```

### Get Live Signals
```bash
curl "http://localhost:8000/api/signals/live"
```

### System Health
```bash
curl "http://localhost:8000/health"
```

## Configuration

### Risk Management Settings
- Max risk per trade: 2% (configurable)
- Position size multiplier: 1.0x (configurable)
- Stop loss ATR multiple: 1.5x
- Daily loss limit: 5%
- Max consecutive losses: 5

### Supported Symbols
- BTCUSDT, ETHUSDT, BNBUSDT, ADAUSDT, SOLUSDT, XRPUSDT
- All Binance USDT pairs supported

## Architecture

### Backend (FastAPI)
```
backend/
├── main.py                 # FastAPI application
├── models.py              # Pydantic models
├── analytics/             # Analysis modules
│   ├── indicators.py      # Technical indicators
│   ├── core_signals.py    # RSI+MACD (40%)
│   ├── smc_analysis.py    # Smart Money (25%)
│   ├── pattern_detection.py # Patterns (20%)
│   ├── sentiment.py       # Sentiment (10%)
│   └── ml_predictor.py    # ML prediction (5%)
├── data/                  # Data management
│   ├── binance_client.py  # Binance API client
│   └── data_manager.py    # Data aggregation
└── risk/                  # Risk management
    └── risk_manager.py    # Position sizing, stops
```

### Frontend (React + TypeScript)
```
src/
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard
│   ├── SignalCard.tsx     # Signal display
│   ├── Chart.tsx          # Price charts
│   └── RiskPanel.tsx      # Risk management
├── services/              # API services
│   ├── api.ts            # REST API client
│   └── websocket.ts      # WebSocket client
└── types/                # TypeScript types
    └── index.ts          # Type definitions
```

## Validation

### Test Backend
```bash
# Health check
curl http://localhost:8000/health

# Generate signal
curl -X POST http://localhost:8000/api/signals/generate \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT"}'

# Get price data
curl http://localhost:8000/api/price/BTCUSDT
```

### Test Frontend
1. Open http://localhost:3000
2. Select a symbol (BTCUSDT, ETHUSDT, etc.)
3. Click "Generate Signal"
4. Verify real-time updates
5. Check WebSocket connection status

## Production Deployment

### Environment Variables
```bash
# Backend
PYTHONPATH=/app
PYTHONUNBUFFERED=1

# Frontend
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

### Docker Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up --scale backend=2 --scale frontend=2
```

## Monitoring

### Health Checks
- Backend: `GET /health`
- WebSocket connections: Real-time status in UI
- System metrics: Available in risk panel

### Logs
```bash
# View backend logs
docker-compose logs -f backend

# View frontend logs
docker-compose logs -f frontend
```

## Troubleshooting

### Common Issues
1. **WebSocket connection failed**: Check backend is running on port 8000
2. **No market data**: Verify Binance API connectivity
3. **Signal generation failed**: Check symbol format (must be USDT pairs)
4. **Docker build failed**: Ensure Docker has sufficient memory (4GB+)

### Debug Mode
```bash
# Backend debug
cd backend
python main.py --reload --log-level debug

# Frontend debug
npm start
# Open browser dev tools for console logs
```

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation at http://localhost:8000/docs
3. Check Docker logs for error messages
4. Verify all dependencies are installed correctly

## Success Criteria ✅

- [x] All API endpoints respond correctly
- [x] Real-time WebSocket data flows
- [x] Mathematical formulas calculate correctly
- [x] Professional UI with live updates
- [x] Docker deployment works
- [x] No errors or placeholder code
- [x] Binance API integration functional
- [x] Complete signal generation pipeline
- [x] Risk management system operational