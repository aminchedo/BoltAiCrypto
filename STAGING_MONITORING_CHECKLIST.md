# 24-Hour Staging Monitoring Checklist

## Deployment Info
- **Branch:** `cursor/integrate-real-time-agent-end-to-end-7469`
- **Start Time:** ________________
- **End Time:** ________________ (24 hours later)
- **Staging URL:** ________________

---

## ✅ IMMEDIATE SMOKE TESTS (Run Right After Deploy)

### Test 1: Health Check (30 seconds)
```bash
# Expected: {"status": "healthy", ...}
curl https://staging-api/health | jq .

# ✅ Pass  ❌ Fail  Notes: ___________
```

### Test 2: Agent Status (1 minute)
```bash
# Get initial state
curl https://staging-api/api/agent/status | jq .

# Expected: {"enabled": true/false, "scan_interval_ms": 30000, ...}

# ✅ Pass  ❌ Fail  Notes: ___________
```

### Test 3: Agent Toggle (2 minutes)
```bash
# Toggle ON
curl -X PUT "https://staging-api/api/agent/toggle?enabled=true" | jq .

# Wait 5 seconds, then check logs for:
# "Real-time agent enabled - starting live scanner"

# Toggle OFF
curl -X PUT "https://staging-api/api/agent/toggle?enabled=false" | jq .

# Check logs for:
# "Real-time agent disabled - stopping live scanner"

# Toggle back ON for monitoring
curl -X PUT "https://staging-api/api/agent/toggle?enabled=true" | jq .

# ✅ Pass  ❌ Fail  Notes: ___________
```

### Test 4: Metrics Baseline (1 minute)
```bash
# Capture baseline metrics
curl https://staging-api/api/metrics | jq . > metrics_baseline_$(date +%Y%m%d_%H%M).json

# Expected fields:
# - websocket.connections: number
# - websocket.messages_sent: number
# - agent.enabled: true

# ✅ Pass  ❌ Fail  Notes: ___________
```

### Test 5: WebSocket Connection (5 minutes)

**Browser Console Test:**
```javascript
// Open staging frontend URL
const ws = new WebSocket('wss://staging-api/ws/realtime');

ws.onopen = () => {
  console.log('✅ Connected');
  ws.send(JSON.stringify({action: 'subscribe', symbols: ['BTCUSDT', 'ETHUSDT']}));
};

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  console.log('📨 Type:', data.type, 'Data:', data);
};

ws.onerror = (e) => console.error('❌ Error:', e);
ws.onclose = () => console.log('🔌 Closed');

// Wait 60 seconds - should see:
// 1. "status" message (on connect)
// 2. "subscription_confirmed" message
// 3. At least 1 "signal" message (within 30-60s)
```

**Capture screenshot of console showing messages**

```
# ✅ Pass  ❌ Fail  Notes: ___________
```

### Test 6: Scanner Run (2 minutes)
```bash
curl -X POST https://staging-api/api/scanner/run \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["BTCUSDT", "ETHUSDT"],
    "timeframes": ["15m", "1h"]
  }' | jq '.results[0]'

# Expected: ScanItem with all fields
# - rank, symbol, price, final_score (0-1)
# - direction: BULLISH/BEARISH/NEUTRAL

# ✅ Pass  ❌ Fail  Notes: ___________
```

### Test 7: Signal Scoring (1 minute)
```bash
curl -X POST https://staging-api/api/signals/score \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTCUSDT",
    "timeframe": "1h"
  }' | jq .

# Expected: {"direction": "...", "confidence": 0.xx, "advice": "..."}

# ✅ Pass  ❌ Fail  Notes: ___________
```

### Test 8: Weight Presets (3 minutes)
```bash
# List presets
curl https://staging-api/api/config/weight-presets | jq .

# Expected: 3 default presets (balanced, aggressive, conservative)

# Save test preset
curl -X POST "https://staging-api/api/config/weight-presets?name=monitoring_test" \
  -H "Content-Type: application/json" \
  -d '{
    "harmonic": 0.2, "elliott": 0.2, "smc": 0.15, "fibonacci": 0.1,
    "price_action": 0.15, "sar": 0.1, "sentiment": 0.05,
    "news": 0.03, "whales": 0.02
  }' | jq .

# Verify saved
curl https://staging-api/api/config/weight-presets | jq '.presets[] | select(.name=="monitoring_test")'

# Clean up
curl -X DELETE "https://staging-api/api/config/weight-presets/monitoring_test" | jq .

# ✅ Pass  ❌ Fail  Notes: ___________
```

---

## 📊 MONITORING SCHEDULE (Every 4 Hours)

### Check #1: Hour 0 (Immediate - Already Done Above)
- ✅ Time: ________________
- ✅ All smoke tests passed

### Check #2: Hour 4
- ⏰ Time: ________________

```bash
# 1. Capture metrics
curl https://staging-api/api/metrics | jq . > metrics_hour04.json

# 2. Check key values
curl https://staging-api/api/metrics | jq '{
  connections: .websocket.connections,
  messages: .websocket.messages_sent,
  agent_enabled: .agent.enabled,
  uptime: .websocket.uptime
}'
```

**Expected:**
- connections: 0-50 (alert if > 100)
- messages_sent: Growing (alert if stuck)
- agent_enabled: true
- uptime: ~14400 seconds (4 hours)

**Logs Check:**
```bash
# Look for errors in last 4 hours
tail -1000 /var/log/staging/backend.log | grep -c ERROR

# Expected: 0 errors
```

**Results:**
- ✅ Pass  ❌ Fail
- Connections: _____
- Messages sent: _____
- Errors found: _____
- Notes: ___________

---

### Check #3: Hour 8
- ⏰ Time: ________________

```bash
curl https://staging-api/api/metrics | jq . > metrics_hour08.json
```

**Comparison:**
```bash
# Compare hour 4 vs hour 8
echo "Hour 4 messages:" && jq .websocket.messages_sent metrics_hour04.json
echo "Hour 8 messages:" && jq .websocket.messages_sent metrics_hour08.json

# Messages should have increased (scanner running)
```

**Results:**
- ✅ Pass  ❌ Fail
- Message growth: _____ (should be > 0)
- WebSocket status: _____
- Notes: ___________

---

### Check #4: Hour 12
- ⏰ Time: ________________

```bash
curl https://staging-api/api/metrics | jq . > metrics_hour12.json
```

**Mid-point verification:**
- Check uptime: ~43200 seconds (12 hours)
- Verify agent still enabled
- Check for any ERROR logs

**Results:**
- ✅ Pass  ❌ Fail
- Uptime matches: _____
- Agent enabled: _____
- Notes: ___________

---

### Check #5: Hour 16
- ⏰ Time: ________________

```bash
curl https://staging-api/api/metrics | jq . > metrics_hour16.json
```

**Results:**
- ✅ Pass  ❌ Fail
- System stable: _____
- Notes: ___________

---

### Check #6: Hour 20
- ⏰ Time: ________________

```bash
curl https://staging-api/api/metrics | jq . > metrics_hour20.json
```

**Results:**
- ✅ Pass  ❌ Fail
- System stable: _____
- Notes: ___________

---

### Check #7: Hour 24 (Final)
- ⏰ Time: ________________

```bash
curl https://staging-api/api/metrics | jq . > metrics_hour24_FINAL.json
```

**Final verification:**
```bash
# 1. Total message count growth
echo "Initial:" && jq .websocket.messages_sent metrics_baseline*.json
echo "Final:" && jq .websocket.messages_sent metrics_hour24_FINAL.json

# 2. Total error count
tail -10000 /var/log/staging/backend.log | grep -c ERROR

# Expected: 0 errors

# 3. Agent still enabled
curl https://staging-api/api/agent/status | jq .agent_enabled
```

**Results:**
- ✅ Pass  ❌ Fail
- Total errors: _____ (MUST be 0 for GO)
- Messages grew: _____ (MUST be YES for GO)
- Agent stable: _____ (MUST be YES for GO)

---

## 🚨 RED FLAGS (Immediate Action Required)

If you see ANY of these, investigate immediately:

### Critical Issues (Stop and Fix)
- ❌ ERROR in logs related to agent/scanner/websocket
- ❌ WebSocket disconnecting > 10 times per hour
- ❌ Scanner not running (messages_sent not growing)
- ❌ Memory/CPU usage trending up continuously
- ❌ Agent toggle doesn't work

### Action:
1. Capture logs: `tail -500 /var/log/staging/backend.log > error_logs_$(date +%Y%m%d_%H%M).txt`
2. Disable agent: `curl -X PUT "https://staging-api/api/agent/toggle?enabled=false"`
3. Review error logs
4. Fix issue or rollback
5. Do NOT proceed to production

---

## ✅ GO/NO-GO DECISION (After 24 Hours)

### ✅ GO Criteria (All Must Be TRUE)
- [ ] All 8 smoke tests passed initially
- [ ] All 7 monitoring checks passed
- [ ] Zero ERROR logs in 24 hours
- [ ] WebSocket stable (< 5 reconnects/hour)
- [ ] Scanner running consistently (messages growing)
- [ ] Agent toggle works reliably
- [ ] Metrics show stable patterns
- [ ] No memory leaks (memory usage stable)
- [ ] UI responsive with no console errors

### ❌ NO-GO Criteria (Any One = NO-GO)
- [ ] Any ERROR logs found
- [ ] WebSocket unstable (> 10 reconnects/hour)
- [ ] Scanner timeouts or failures
- [ ] Memory/CPU usage trending up
- [ ] Agent toggle unreliable
- [ ] UI shows errors

---

## 📊 FINAL DECISION

**Date:** ________________
**Time:** ________________

### Decision: ⬜ GO  ⬜ NO-GO

**If GO:**
- Proceed to merge PR to main
- Deploy main to production
- Run production smoke tests

**If NO-GO:**
- Document issues found
- Fix on feature branch
- Re-deploy to staging
- Restart 24h monitoring

**Signed:** ________________

---

## 📸 EVIDENCE TO COLLECT

Save these for your records:

1. **Screenshots:**
   - [ ] WebSocket console messages (showing signal, status types)
   - [ ] Agent toggle UI (ON and OFF states)
   - [ ] Scanner results table populated
   - [ ] Metrics dashboard (if you have one)

2. **Log Files:**
   - [ ] `metrics_baseline_*.json`
   - [ ] `metrics_hour04.json` through `metrics_hour24_FINAL.json`
   - [ ] Error logs (if any): `error_logs_*.txt`
   - [ ] Backend logs showing scanner start/stop

3. **Test Results:**
   - [ ] All smoke test outputs
   - [ ] Curl command responses

---

## 🆘 TROUBLESHOOTING QUICK REFERENCE

### Issue: Agent won't toggle
```bash
# Check backend logs
tail -100 /var/log/staging/backend.log | grep agent

# Restart backend if needed
# (Your deploy process)
```

### Issue: WebSocket won't connect
```bash
# Test direct connection
wscat -c wss://staging-api/ws/realtime

# Check CORS and nginx/proxy config
```

### Issue: No signal messages
```bash
# Verify agent is enabled
curl https://staging-api/api/agent/status

# Check if subscribed (in browser console)
ws.send(JSON.stringify({action:'subscribe', symbols:['BTCUSDT']}))
```

### Issue: High CPU/Memory
```bash
# Increase scan interval
curl -X PUT "https://staging-api/api/agent/config?scan_interval_ms=60000"

# Or disable agent temporarily
curl -X PUT "https://staging-api/api/agent/toggle?enabled=false"
```

---

**For full troubleshooting guide, see `INTEGRATION_RUNBOOK.md`**
