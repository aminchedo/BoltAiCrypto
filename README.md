# HTS Trading System

A comprehensive TypeScript/React + FastAPI trading system with advanced analytics, machine learning predictions, and real-time WebSocket communication.

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL (optional for full functionality)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure backend environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your API keys and database settings
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts both frontend (Vite) and backend (Uvicorn) concurrently.

   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000

### Docker Setup

Build and run with Docker Compose:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Environment Variables

### Frontend (.env.development / .env.production)
- `VITE_API_URL` - Backend API URL
- `VITE_WS_URL` - WebSocket URL
- `VITE_COINMARKETCAP_API_KEY` - CoinMarketCap API key (optional)
- `VITE_CRYPTOCOMPARE_API_KEY` - CryptoCompare API key (optional)

### Backend (backend/.env)
- Database, trading APIs, JWT settings, etc.
- See `backend/.env.example` for all available options

## API Endpoints

- `GET /health` - Health check
- `GET /api/price/{symbol}` - Get price data
- `WebSocket /ws/signals` - Real-time trading signals

## Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build frontend for production
- `npm run frontend:dev` - Start only frontend
- `npm run backend:dev` - Start only backend

## Features

- Real-time market data and trading signals
- Advanced technical analysis with SMC (Smart Money Concepts)
- Machine learning price predictions
- Portfolio management and P&L tracking
- Risk management and alerts
- WebSocket-based real-time updates
- Responsive modern UI with Tailwind CSS