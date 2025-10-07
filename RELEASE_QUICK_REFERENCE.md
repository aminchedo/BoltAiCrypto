# 🚀 v1.0.0 Release - Quick Reference Card

**Print this and keep it handy during deployment!**

---

## ⚡ Quick Start

```bash
# Run this ONE command to start the release process:
./scripts/release-helper.sh
```

This automated script will:
- ✅ Verify git status and branch
- ✅ Run pre-release checks
- ✅ Build production bundle
- ✅ Generate SHA256 checksums
- ✅ Display next steps

---

## 📦 Release Commands (Copy-Paste Ready)

### 1. Create Git Tag
```bash
git tag -a v1.0.0 -m "HTS Trading Dashboard v1.0.0 — production-ready (31/31)"
git push origin v1.0.0
```

### 2. Create GitHub Release
```bash
gh release create v1.0.0 \
  --title "HTS Trading Dashboard v1.0.0" \
  --notes-file RELEASE_NOTES.md \
  dist.SHA256.txt
```

**Or via GitHub UI**: https://github.com/YOUR-ORG/YOUR-REPO/releases/new

---

## 🔧 Production Environment Variables

**Required** (set these in your hosting provider):

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_ENV=production
VITE_DEBUG=false
```

Full template: `.env.production.template`

---

## ✅ Smoke Tests (10-15 min)

| Test | Pass | Fail | Notes |
|------|------|------|-------|
| 1. Page loads (no console errors) | ☐ | ☐ | |
| 2. Asset switching works | ☐ | ☐ | |
| 3. Portfolio timeframes switch | ☐ | ☐ | |
| 4. SignalCard actions work | ☐ | ☐ | |
| 5. Scanner keyboard shortcuts | ☐ | ☐ | |
| 6. Strategy builder backtest | ☐ | ☐ | |
| 7. Layout check (1366×768) | ☐ | ☐ | |
| 8. Keyboard navigation (Tab) | ☐ | ☐ | |
| 9. Lighthouse score >80 | ☐ | ☐ | |

**Full checklist**: `SMOKE_TESTS.md`

---

## 📊 Monitoring (First 24-48h)

### Watch These Metrics

| Metric | Target | Alert If |
|--------|--------|----------|
| **Error rate** | <1% | >5% |
| **API p95 latency** | <2s | >2s |
| **WebSocket connect** | >90% | <90% |
| **LCP** (Core Web Vital) | <2.5s | >3s |
| **Memory usage** | <150MB | >150MB |

### Quick Health Check
```bash
# Every 5 minutes (first hour)
curl https://your-domain.com/health
```

**Full guide**: `MONITORING_AND_ROLLBACK.md`

---

## 🆘 Rollback (IF NEEDED)

### Quick Rollback (5-10 min)
```bash
git checkout main
git pull --ff-only
git revert -m 1 82e4481
git push origin main
# Re-deploy from main
```

### Health Check After Rollback
```bash
curl https://your-domain.com/health
# Verify no console errors
# Run smoke tests again
```

**Full rollback guide**: `MONITORING_AND_ROLLBACK.md` (Section 5)

---

## 📞 Emergency Contacts

| Role | Name | Contact |
|------|------|---------|
| Release Manager | _________ | _________ |
| On-Call Engineer | _________ | _________ |
| Backup Engineer | _________ | _________ |
| Hosting Support | _________ | _________ |

**Team Slack**: #___________

---

## 🎯 Decision Matrix

| If... | Then... |
|-------|---------|
| Smoke tests pass | ✅ Proceed with deployment |
| Minor issues (<5% users) | ⚠️ Deploy + monitor closely |
| Major issues (>5% users) | 🛑 Rollback immediately |
| Unsure | 🛑 Don't deploy, investigate first |

---

## 📚 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| **RELEASE_READINESS_SUMMARY.md** | Full release overview |
| **SMOKE_TESTS.md** | Detailed test procedures |
| **MONITORING_AND_ROLLBACK.md** | Monitoring + incident response |
| **ESLINT_WARNINGS_STATUS.md** | Post-release improvement plan |
| **.env.production.template** | Environment variables guide |
| **RELEASE_NOTES.md** | Content for GitHub release |

---

## ⏱️ Timeline (Reference)

| Phase | Duration | Status |
|-------|----------|--------|
| 1. Run release-helper.sh | 5 min | ☐ |
| 2. Create git tag + GitHub release | 5 min | ☐ |
| 3. Deploy to production | 10 min | ☐ |
| 4. Run smoke tests | 15 min | ☐ |
| 5. Set up monitoring | 10 min | ☐ |
| **Total** | **45 min** | |

---

## ✅ Go/No-Go Checklist

### Before Deployment
- [ ] `./scripts/release-helper.sh` passed all checks
- [ ] `dist/` and `dist.SHA256.txt` generated
- [ ] Git tag v1.0.0 created and pushed
- [ ] GitHub release created with RELEASE_NOTES.md
- [ ] Production env vars configured
- [ ] Team notified of deployment start
- [ ] Rollback plan understood

### After Deployment
- [ ] Production URL loads successfully
- [ ] Health check endpoint returns 200 OK
- [ ] No console errors
- [ ] Smoke tests passed (8/8 minimum)
- [ ] Monitoring dashboards configured
- [ ] Team notified of successful deployment

---

## 🚀 One-Liner Summary

```
Run ./scripts/release-helper.sh → Create tag → Deploy → Smoke test → Monitor for 48h
```

---

## 🎉 Success Indicators

You're good if:
- ✅ All smoke tests pass
- ✅ Error rate <1%
- ✅ API latency <2s (p95)
- ✅ No console errors
- ✅ Lighthouse score >80

---

**Version**: 1.0.0  
**Commit**: 82e4481  
**Date**: October 7, 2025

---

*Print this page and check off items as you go. Good luck! 🚀*
