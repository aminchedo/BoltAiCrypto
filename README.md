# HTS Trading System

A comprehensive TypeScript/React + FastAPI trading system with advanced analytics, machine learning predictions, and real-time WebSocket communication.

---

## ⚠️ SECURITY WARNING: Development Mode

**This project currently runs in PUBLIC MODE by default (no authentication required).**

### 🔓 Dev Mode (Current Default)
- **No authentication** - Direct access to dashboard
- **Public endpoints** - All API routes accessible without tokens
- **⚠️ SECURITY RISK** - Never expose to public internet
- **Use ONLY in:**
  - Local development environments
  - Networks behind VPN or firewall
  - Internal/private staging environments

### 🔐 Production Mode (Secure)
To enable authentication for production:

**Frontend** - Set in `.env.production`:
```bash
VITE_REQUIRE_LOGIN=true
```

**Backend** - Set in `backend/.env`:
```bash
PUBLIC_MODE=false
ENVIRONMENT=production
```

### Risk Mitigation
- ✅ Keep dev mode **local only** (localhost, 127.0.0.1)
- ✅ Use VPN/firewall for any networked dev/staging instances
- ✅ **Never deploy** public-mode builds to public URLs
- ✅ Enable authentication before any production deployment
- ✅ Use HTTPS/TLS in production
- ✅ Configure proper CORS origins (not `*`)

---

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
- `VITE_REQUIRE_LOGIN` - **Authentication toggle** (`true` for production, `false` for dev)
- `VITE_COINMARKETCAP_API_KEY` - CoinMarketCap API key (optional)
- `VITE_CRYPTOCOMPARE_API_KEY` - CryptoCompare API key (optional)

### Backend (backend/.env)
- `PUBLIC_MODE` - **Authentication toggle** (`false` for production, `true` for dev)
- `ENVIRONMENT` - `production` or `development`
- `CORS_ORIGINS` - Comma-separated allowed origins (e.g., `http://localhost:5173,http://localhost:3000`)
- `RATE_LIMIT_CALLS` - Max requests per period (default: 100)
- `RATE_LIMIT_PERIOD` - Rate limit window in seconds (default: 60)
- Database, trading APIs, JWT settings, etc.
- See `backend/.env.example` for all available options

### Security Configuration
**Always ensure these settings for production:**
```bash
# backend/.env
PUBLIC_MODE=false
ENVIRONMENT=production
CORS_ORIGINS=https://your-actual-domain.com
RATE_LIMIT_CALLS=50
RATE_LIMIT_PERIOD=60

# .env.production
VITE_REQUIRE_LOGIN=true
VITE_API_URL=https://your-api-domain.com
```

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
- **Security features:**
  - Rate limiting (configurable per endpoint)
  - Security headers (HSTS, X-Frame-Options, CSP)
  - Optional authentication mode
  - CORS protection

## Development vs Production

### Development Mode (Current)
```bash
# Backend runs with PUBLIC_MODE=true
npm run dev
```
- No login required
- All endpoints public
- Suitable for local testing only

### Production Mode
```bash
# 1. Update environment variables
# Set VITE_REQUIRE_LOGIN=true in .env.production
# Set PUBLIC_MODE=false in backend/.env

# 2. Build and deploy
npm run build
```
- Authentication required
- Protected endpoints
- Rate limiting enforced
- Security headers active

## Pre-Production Checklist

Before deploying to any public URL:

- [ ] Set `PUBLIC_MODE=false` in backend environment
- [ ] Set `VITE_REQUIRE_LOGIN=true` in frontend environment
- [ ] Configure specific `CORS_ORIGINS` (remove wildcards)
- [ ] Enable HTTPS/TLS
- [ ] Set appropriate rate limits for production load
- [ ] Verify all secrets come from environment (no hardcoded values)
- [ ] Enable logging and monitoring
- [ ] Test authentication flow
- [ ] Verify 401/403 responses on protected endpoints without auth
- [ ] Review and restrict database permissions