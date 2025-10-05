# v0.1.0 — Dev Stabilization & CI

## 🎉 Highlights

This release establishes a stable development foundation with comprehensive tooling, CI/CD pipeline, and standardized workflows.

## ✨ Features

- **Frontend on port 3030/5173** - Conflict-free development server configuration
- **Backend CORS** - Supports ports 3000, 3030, and 5173 for flexible frontend development
- **Environment-based URLs** - VITE_ and NEXT_PUBLIC_ prefix support for API/WebSocket URLs
- **Unified Development Scripts** - Makefile and root package.json scripts for fast iteration
- **GitHub Actions CI** - Automated frontend builds and backend smoke tests
- **Health Endpoint Aliases** - Both `/health` and `/api/health` available for consistency

## 📚 Documentation

- ✅ PR template added (`.github/pull_request_template.md`)
- ✅ README badges for CI status and license
- ✅ Dev URLs documented in README
- ✅ Assembly status guide (`ASSEMBLY_STATUS.md`)

## 🛠️ Developer Experience

### Quick Start Commands

```bash
# Install and run everything
npm install
npm run dev
```

### Smoke Tests

```bash
npm run smoke:be       # Test backend health
npm run smoke:markets  # Test markets endpoint
npm run smoke:signals  # Test signals endpoint
```

## 🔧 Infrastructure

- **CI Pipeline**: Automated TypeScript checking, frontend builds, and backend smoke tests
- **Concurrent Dev**: Single command starts both frontend and backend
- **Standardized Workflows**: Consistent commands across local and CI environments

## 📦 Files Changed

- `.github/pull_request_template.md` - PR template
- `.github/workflows/ci.yml` - CI/CD pipeline
- `README.md` - Added badges and dev URLs
- `package.json` - Smoke test and dev scripts
- `backend/main.py` - Health endpoint alias
- `ASSEMBLY_STATUS.md` - Development workflow documentation

## 🚀 Next Steps

- [ ] Add automated integration tests
- [ ] Set up staging environment  
- [ ] Configure production deployment
- [ ] Add performance monitoring

---

**Full Changelog**: https://github.com/aminchedo/BoltAiCrypto/commits/v0.1.0
