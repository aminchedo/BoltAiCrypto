# 🧪 Production Smoke Tests - v1.0.0

**Purpose**: Verify critical functionality immediately after production deployment.  
**Duration**: ~10-15 minutes  
**Run by**: Release manager or QA lead

---

## Pre-Test Setup

- [ ] Production URL accessible: `https://your-domain.com`
- [ ] Browser DevTools open (Console + Network tabs)
- [ ] Test at **1366×768** and **1440×900** resolutions
- [ ] Browser zoom: **100%**
- [ ] Test browsers: Chrome, Firefox, Safari (at least 2)

---

## 1. Initial Load & Console Check

### Test Steps
1. Navigate to production URL in a fresh incognito/private window
2. Wait for full page load (no spinners)
3. Check browser console

### Expected Results
- [ ] Page loads within 3 seconds
- [ ] Dashboard displays with data
- [ ] **Zero console errors** (warnings ok)
- [ ] No 404s in Network tab
- [ ] All images/icons load correctly

### Screenshot
- [ ] Capture full dashboard on successful load

---

## 2. Asset Switching & Data Refresh

### Test Steps
1. Click asset selector in header
2. Select "BTC/USD"
3. Wait for data to update
4. Select "ETH/USD"
5. Verify all panels update

### Expected Results
- [ ] Asset selector opens smoothly
- [ ] Asset changes reflected in header
- [ ] **All panels update** with new asset data:
  - [ ] Price chart
  - [ ] News feed (with "Last updated" timestamp)
  - [ ] Sentiment widget (with "Data source" label)
  - [ ] Whale tracker
- [ ] No layout shift during update
- [ ] Loading states show briefly (spinners)

---

## 3. Portfolio Timeframe Switching

### Test Steps
1. Navigate to Portfolio page
2. Click timeframe buttons: **1D → 1W → 1M → 3M → 1Y → ALL**
3. Verify chart updates each time

### Expected Results
- [ ] Chart updates smoothly for each timeframe
- [ ] No horizontal scrollbar appears
- [ ] Axis labels adjust appropriately
- [ ] Loading state shows briefly
- [ ] **No layout shift** or content jump

---

## 4. Signal Card Interactions

### Test Steps
1. Navigate to Dashboard or Scanner page
2. Locate a SignalCard
3. Test each action button:
   - Click **"Details"** → Modal opens
   - Click **"Trade"** → Confirmation appears
   - Click **"Dismiss"** → Card disappears
4. Refresh page
5. Verify dismissed signal persists (still hidden)

### Expected Results
- [ ] Details modal opens with full signal breakdown
- [ ] Modal has focus trap (Tab stays inside)
- [ ] Press **Esc** → Modal closes
- [ ] Trade button shows confirmation dialog
- [ ] Dismiss removes card immediately
- [ ] Dismissed state persists after page refresh
- [ ] No console errors

---

## 5. Market Scanner - Views & Shortcuts

### Test Steps
1. Navigate to Scanner page
2. Press keyboard shortcuts:
   - `1` → List view
   - `2` → Grid view
   - `3` → Chart view
   - `4` → Heatmap view
3. Press `?` to show shortcuts help
4. Press `Esc` to close help
5. Press `Ctrl+Q` to trigger Quick Scan
6. Press `F` to toggle filters panel

### Expected Results
- [ ] All view modes switch instantly
- [ ] No layout shift between views
- [ ] Shortcuts help modal displays all keys
- [ ] Esc closes modals
- [ ] Quick Scan triggers (loading state + toast)
- [ ] Filters panel toggles smoothly
- [ ] No console errors

---

## 6. Strategy Builder - Preset & Backtest

### Test Steps
1. Navigate to Strategy Builder page
2. Click **"Load Preset"** dropdown
3. Select **"Aggressive"** preset
4. Verify weights update
5. Click **"Run Backtest"** button
6. Wait for results
7. Check for **"Latency"** and **"Sample size"** metrics

### Expected Results
- [ ] Preset loads instantly
- [ ] Weight sliders update to preset values
- [ ] Backtest button shows loading state
- [ ] Results display within 3 seconds
- [ ] Latency metric shown (e.g., "128ms")
- [ ] Sample size shown (e.g., "1,247 signals")
- [ ] Charts render correctly
- [ ] No console errors

---

## 7. Layout & Responsive Check

### Test Steps
1. Set browser to **1366×768** resolution
2. Set zoom to **100%**
3. Measure header height (DevTools)
4. Measure sidebar width (expanded)
5. Measure sidebar width (collapsed)
6. Resize to **1024×768** → Verify auto-collapse
7. Check all pages for horizontal scrollbars

### Expected Results
- [ ] Header height: **≤64px** (target: 51.2px)
- [ ] Sidebar expanded: **~224px**
- [ ] Sidebar collapsed: **~57.6px**
- [ ] Sidebar auto-collapses at **<1280w** or **<720h**
- [ ] **No horizontal scrollbar** on any page
- [ ] All content fits within viewport
- [ ] Text remains readable (no truncation)

---

## 8. Accessibility - Keyboard Navigation

### Test Steps
1. Navigate to Dashboard page
2. Press **Tab** repeatedly:
   - Focus moves to header links
   - Focus moves to sidebar items
   - Focus moves to primary panels
   - Focus moves to action buttons
3. Press **Enter** on a sidebar item → Page navigates
4. Open a modal (e.g., Signal Details)
5. Press **Tab** → Focus stays in modal (focus trap)
6. Press **Esc** → Modal closes

### Expected Results
- [ ] Tab order is logical (top-to-bottom, left-to-right)
- [ ] **Focus indicator visible** on all elements (cyan outline)
- [ ] Enter activates links/buttons
- [ ] Modal has focus trap (Tab cycles inside)
- [ ] Esc closes modals/panels
- [ ] No keyboard traps (can exit all areas)

---

## 9. Accessibility - Screen Reader Test (Optional but Recommended)

### Test Steps
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. Navigate Dashboard page
3. Verify announcements for:
   - Page title
   - Section headings
   - Button labels
   - Form fields

### Expected Results
- [ ] Page title announced
- [ ] Headings announced with levels
- [ ] Buttons have descriptive labels
- [ ] Form fields have labels
- [ ] No "button" or "link" without context

---

## 10. Quick Performance Check

### Test Steps
1. Open Chrome DevTools → **Lighthouse** tab
2. Run **Performance** audit (mobile)
3. Check Core Web Vitals:
   - **LCP** (Largest Contentful Paint)
   - **INP** (Interaction to Next Paint)
   - **CLS** (Cumulative Layout Shift)

### Expected Results
- [ ] Performance score: **≥80** (green)
- [ ] LCP: **≤2.5s** (good)
- [ ] INP: **≤200ms** (good)
- [ ] CLS: **≤0.1** (good)
- [ ] No critical accessibility issues

---

## Smoke Test Summary

### Results
- **Tests Passed**: _____ / 10
- **Tests Failed**: _____ / 10
- **Critical Issues**: _____ (blocking)
- **Minor Issues**: _____ (non-blocking)

### Decision
- [ ] ✅ **PASS** - Production deployment approved
- [ ] ⚠️  **PASS WITH WARNINGS** - Deploy with tracking issues
- [ ] ❌ **FAIL** - Rollback required

### Sign-off
- **Tested by**: _______________________
- **Date**: _______________________
- **Time**: _______________________
- **Browser(s)**: _______________________

---

## Appendix: Quick Console Check Commands

Run these in DevTools Console for quick checks:

```javascript
// Check for React errors
console.log('React version:', React.version);

// Check WebSocket connection
console.log('WS connected:', window.ws?.readyState === 1);

// Check localStorage
console.log('LocalStorage keys:', Object.keys(localStorage));

// Check for performance entries
console.log('Navigation timing:', performance.getEntriesByType('navigation')[0]);
```

---

**Last updated**: October 7, 2025  
**Version**: 1.0.0  
**Status**: Ready for production
