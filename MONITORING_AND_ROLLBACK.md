# 📊 Production Monitoring & Rollback Procedures

**Version**: 1.0.0  
**Last Updated**: October 7, 2025

---

## 🎯 Overview

This document outlines monitoring strategy and rollback procedures for the HTS Trading Dashboard production deployment. Follow these procedures to ensure system health and rapid incident response.

---

## 1. Critical Metrics to Monitor

### 📈 First 24-48 Hours (High Priority)

#### JavaScript Errors
- **Where**: Browser console / Error tracking (Sentry/LogRocket)
- **What to watch**:
  - Error rate (errors/minute)
  - Top error stacks
  - Affected users/browsers
- **Alert threshold**: >5 errors/minute
- **Action**: Investigate immediately, consider hotfix or rollback

#### API Performance
- **Where**: Backend logs / APM (Datadog/New Relic)
- **What to watch**:
  - Request rate (req/sec)
  - Error rate (4xx, 5xx)
  - Latency (p50, p95, p99)
- **Alert thresholds**:
  - Error rate: >5%
  - p95 latency: >2s
  - p99 latency: >5s
- **Action**: Check backend health, database connections

#### WebSocket Health
- **Where**: Backend WebSocket logs
- **What to watch**:
  - Connection success rate
  - Disconnect rate
  - Message throughput
  - Reconnection attempts
- **Alert thresholds**:
  - Connection failure: >10%
  - Disconnects: >20%/hour
- **Action**: Check WebSocket server, network issues

#### Core Web Vitals
- **Where**: Google Search Console / RUM (Real User Monitoring)
- **What to watch**:
  - **LCP** (Largest Contentful Paint): <2.5s
  - **INP** (Interaction to Next Paint): <200ms
  - **CLS** (Cumulative Layout Shift): <0.1
- **Alert thresholds**: Any metric >75th percentile threshold
- **Action**: Identify slow pages, optimize critical path

#### Memory Usage
- **Where**: Browser DevTools / Performance monitoring
- **What to watch**:
  - Heap size growth over time
  - Memory leaks on chart/heatmap pages
  - GC (garbage collection) frequency
- **Alert threshold**: Heap size >150MB after 5 minutes
- **Action**: Check for memory leaks, unbounded arrays

---

## 2. Monitoring Dashboard Setup

### Recommended Tools

**Free/Open Source:**
- **Frontend Errors**: [Sentry](https://sentry.io) (free tier: 5K errors/month)
- **Analytics**: [Plausible](https://plausible.io) or [Umami](https://umami.is)
- **Uptime**: [UptimeRobot](https://uptimerobot.com) (free tier: 50 monitors)

**Paid (Optional):**
- **APM**: Datadog, New Relic, or Grafana Cloud
- **RUM**: SpeedCurve, Calibre, or LogRocket
- **Logging**: Logtail, Papertrail, or Datadog Logs

### Quick Setup Checklist

- [ ] Set up error tracking (Sentry)
  - [ ] Add DSN to production env
  - [ ] Configure source maps upload
  - [ ] Set release version (v1.0.0)
  - [ ] Test error reporting

- [ ] Set up uptime monitoring (UptimeRobot)
  - [ ] Add production URL
  - [ ] Set check interval (5 minutes)
  - [ ] Configure alert contacts

- [ ] Set up analytics (Plausible/Umami)
  - [ ] Add tracking script
  - [ ] Test page views
  - [ ] Configure goals (e.g., "Signal Executed")

- [ ] Set up backend monitoring
  - [ ] Enable API logs
  - [ ] Configure log aggregation
  - [ ] Set up alerts (email/Slack)

---

## 3. Health Check Endpoints

### Frontend Health Check
**URL**: `https://your-domain.com/health`  
**Expected Response**: 200 OK with build info

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2025-10-07T12:00:00Z"
}
```

### Backend Health Check
**URL**: `https://api.your-domain.com/health`  
**Expected Response**: 200 OK with system status

```json
{
  "status": "healthy",
  "database": "connected",
  "websocket": "active",
  "timestamp": "2025-10-07T12:00:00Z"
}
```

### Automated Health Checks
```bash
# Run every 5 minutes via cron
*/5 * * * * curl -f https://your-domain.com/health || echo "Health check failed" | mail -s "HTS Health Alert" your@email.com
```

---

## 4. Incident Response Workflow

### Severity Levels

**P0 - Critical (Immediate)**
- Site completely down
- Data loss/corruption
- Security breach
- **Response time**: <5 minutes
- **Action**: Rollback immediately

**P1 - High (Urgent)**
- Major feature broken
- High error rate (>10%)
- Severe performance degradation
- **Response time**: <15 minutes
- **Action**: Investigate + hotfix or rollback

**P2 - Medium (Important)**
- Minor feature broken
- Moderate error rate (5-10%)
- Minor performance issues
- **Response time**: <1 hour
- **Action**: Investigate + hotfix in next deployment

**P3 - Low (Can Wait)**
- UI glitch
- Low error rate (<5%)
- Enhancement request
- **Response time**: <24 hours
- **Action**: Track for next release

### Incident Checklist

When an incident is detected:

1. [ ] **Assess severity** (P0-P3)
2. [ ] **Notify team** (Slack/email)
3. [ ] **Check monitoring dashboards**
   - [ ] Error tracking
   - [ ] API logs
   - [ ] WebSocket logs
   - [ ] User reports
4. [ ] **Document incident**
   - Time detected
   - Symptoms
   - Affected users/features
   - Root cause hypothesis
5. [ ] **Decide action**:
   - [ ] Hotfix (if small and safe)
   - [ ] Rollback (if unsure or critical)
   - [ ] Monitor (if low impact)

---

## 5. Rollback Procedures

### Option A: Revert Merge Commit (Recommended for Critical Issues)

**When to use**: P0/P1 incidents where hotfix will take >10 minutes

```bash
# 1. Verify current state
git log --oneline -5

# 2. Identify merge commit to revert (v1.0.0 merge)
git log --grep="v1.0.0" --oneline

# 3. Revert the merge commit
git checkout main
git pull --ff-only
git revert -m 1 82e4481  # Replace with actual merge commit hash
git push origin main

# 4. Trigger production deployment from main
# (Use your CD pipeline: Vercel, Netlify, GitHub Actions, etc.)

# 5. Verify rollback successful
curl https://your-domain.com/health
```

**Estimated time**: 5-10 minutes

### Option B: Hotfix (For Non-Critical Issues)

**When to use**: P1/P2 incidents with known, simple fix

```bash
# 1. Create hotfix branch from main
git checkout main
git pull --ff-only
git checkout -b hotfix/fix-description

# 2. Make minimal fix (single file preferred)
# ... edit files ...

# 3. Test locally
npm run build
npm run preview

# 4. Commit and push
git add .
git commit -m "hotfix: Brief description of fix"
git push origin hotfix/fix-description

# 5. Create PR and fast-track review
gh pr create --title "Hotfix: Brief description" --body "Fixes P1 incident"

# 6. Merge and deploy
gh pr merge --squash --delete-branch
# Trigger deployment
```

**Estimated time**: 15-30 minutes

### Option C: Redeploy Previous Version

**When to use**: Need to rollback but merge revert is complex

```bash
# 1. Find previous working tag/commit
git tag --list
git log --oneline | head -10

# 2. Check out previous version
git checkout v0.9.0  # Or previous commit hash

# 3. Build and deploy
npm ci
npm run build

# 4. Deploy dist/ to production manually
# (Upload to CDN or trigger deployment with specific commit)

# 5. Create revert PR for main branch
git checkout main
git revert 82e4481
git push origin main
```

**Estimated time**: 10-20 minutes

---

## 6. Post-Rollback Steps

After rolling back:

1. [ ] **Verify rollback successful**
   - [ ] Site loads correctly
   - [ ] No new errors in console
   - [ ] Health checks pass

2. [ ] **Notify stakeholders**
   - Users (if customer-facing)
   - Team (Slack/email)
   - Management (if P0)

3. [ ] **Create incident report**
   - Timeline
   - Root cause
   - Impact (users affected, duration)
   - Resolution steps
   - Prevention measures

4. [ ] **Schedule hotfix PR**
   - Fix root cause
   - Add tests
   - Review thoroughly
   - Deploy during low-traffic hours

5. [ ] **Update monitoring**
   - Add alerts for similar issues
   - Improve health checks

---

## 7. Rollback Testing (Pre-Deployment)

Test rollback procedure in staging before going live:

```bash
# In staging environment:
# 1. Deploy v1.0.0
# 2. Simulate failure (e.g., break API endpoint)
# 3. Execute rollback procedure
# 4. Verify staging works on previous version
# 5. Time the entire process
```

**Expected rollback time**: <10 minutes

---

## 8. Communication Templates

### Incident Notification (Internal)

```
🚨 INCIDENT ALERT

Severity: [P0/P1/P2/P3]
Detected: [Time]
Impact: [Brief description]
Affected: [Users/features]
Status: Investigating / Rolling back / Fixed

Updates: [Link to incident doc]
```

### User Notification (External, if needed)

```
We're experiencing technical issues with the HTS Trading Dashboard.

Impact: [Brief, non-technical description]
ETA: [Estimated resolution time]
Status: [Current status]

We'll update this page as we learn more: [Status page URL]

Sorry for the inconvenience!
```

### Resolution Announcement

```
✅ RESOLVED

The issue affecting [feature] has been resolved.

Duration: [Start time] to [End time] ([Total duration])
Root cause: [Brief explanation]
Prevention: [What we're doing to prevent this]

Thank you for your patience!
```

---

## 9. Weekly Health Review

Every week, review these metrics:

- [ ] Total errors (trend)
- [ ] Average API latency (trend)
- [ ] Core Web Vitals (trend)
- [ ] Uptime percentage
- [ ] User-reported issues

**Action items**:
- Create issues for recurring problems
- Celebrate improvements
- Adjust monitoring thresholds if needed

---

## 10. Contact Information

**On-Call Engineer**: [Name/Phone]  
**Backup**: [Name/Phone]  
**Hosting Provider Support**: [Phone/URL]  
**Emergency Escalation**: [Manager name/phone]

---

## Quick Reference Card

**For P0/P1 incidents:**

1. Check error rate: [Sentry URL]
2. Check API health: [APM URL]
3. Check uptime: [UptimeRobot URL]
4. If >5 min to fix: **Rollback**
5. Rollback command: `git revert -m 1 82e4481 && git push origin main`
6. Notify team: [Slack channel]
7. Document: [Incident tracker]

---

**Last updated**: October 7, 2025  
**Version**: 1.0.0  
**Next review**: October 14, 2025
