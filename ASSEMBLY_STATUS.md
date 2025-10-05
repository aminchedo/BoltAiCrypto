# Assembly Status - HTS Trading System

## Current State
- ✅ Frontend: React + TypeScript + Vite (port 5173 or 3030)
- ✅ Backend: FastAPI + Python (port 8000)
- ✅ CI/CD: GitHub Actions workflow
- ✅ Docker: Multi-stage builds for production
- ✅ PR Template: Standardized pull request format

## Dev Workflow

### Quick Start
```bash
# Install dependencies
npm install

# Start both frontend and backend concurrently
npm run dev
```

### Individual Services
```bash
# Frontend only
npm run frontend:dev

# Backend only
npm run backend:dev
```

## Smoke Tests (Unified)

These commands work both locally and in CI:

```bash
# Test backend health
npm run smoke:be

# Test markets endpoint
npm run smoke:markets

# Test signals endpoint
npm run smoke:signals
```

## Build & Deploy

```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### Backend (backend/.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/hts
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
```

## CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Builds frontend with TypeScript checking
2. Runs backend smoke tests
3. Validates health endpoints
4. Reports status via badges

## Next Steps

- [ ] Add automated integration tests
- [ ] Set up staging environment
- [ ] Configure production deployment
- [ ] Add performance monitoring
