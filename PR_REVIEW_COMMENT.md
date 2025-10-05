## PR Review Summary

**Status:** ✅ Verified locally (auth removed, dashboard loads directly, public endpoints OK)

**Frontend**

* `App.tsx`: removed the entire auth flow (imports, state, effects, handlers). Root now renders `<Dashboard />`.
* `Dashboard.tsx`: made `user` and `onLogout` props optional to preserve API surface and avoid breaking changes.

**Backend**

* `main.py`: removed `Depends(get_current_user)` from:

  * `/api/analysis/multi-timeframe/{symbol}` (line 1343)
  * `/api/risk/metrics` (line 1373)
  * `/api/portfolio/positions` (line 1407)

**Tests**

* `backend/tests/test_health.py`: minimal tests covering `/health`, `/api/price`, `/api/ohlcv`.
  Ensures **no 401/403** for dashboard-critical endpoints.

**Verification**

* ✅ No redirects to `/login`; `/` renders **Dashboard**.
* ✅ All token/isAuth guards removed from `App.tsx`.
* ✅ Dashboard endpoints accessible without auth.
* ✅ npm deps installed; Dockerfiles validated (daemon not available env-side).
* ✅ Commit `d172ebc`: `chore(qa): verify direct dashboard access and add minimal health test` (5 files, 39+ / 51−).

**Security Note:** This build is **auth-less**; suitable for local/closed networks only.

---

## Next Steps (Actionable)

### 1) CI/CD & Quality Gates (immediate)

* [ ] Add/update **CI** to run:

  * `npm run typecheck && npm run build`
  * `pytest -q backend/tests`
  * optional: docker build (if runner supports Docker)
* [ ] Add a **secret scan** step (e.g., Gitleaks) to prevent regressions.
* [ ] Add **ESLint/Prettier** (if not already) and run on PR.

**Example CI additions (short):**

```yaml
# Add to .github/workflows/ci.yml
- name: Secret scan
  uses: gitleaks/gitleaks-action@v2
  with:
    args: --no-banner -v
```

### 2) Hardening (dev/staging)

* [ ] CORS whitelist: dev only (`http://localhost:5173,http://localhost:3000`).
* [ ] Add simple **rate limit** middleware to backend (dev-safe).
* [ ] Ensure **security headers** (HSTS, X-Frame-Options, etc.) are applied (already suggested earlier).

### 3) Feature Flag (safe toggle)

* [ ] Introduce a **feature flag** to re-enable login without code churn:

  * Frontend: `VITE_REQUIRE_LOGIN=false`
  * Backend: `PUBLIC_MODE=true`
* [ ] Gate route protection and dependency injection with these flags so switching back to auth is one-line.

**Example (frontend gate):**

```ts
const REQUIRE_LOGIN = import.meta.env.VITE_REQUIRE_LOGIN === 'true';
```

### 4) Document the Mode

* [ ] Update `README.md` with a **big warning** block:

  * "Dev Mode (No Auth)" vs "Prod Mode (Auth Required)"
  * How to toggle with env variables
  * Risk profile and recommended network boundaries (VPN, firewalled staging)

### 5) Broader Test Coverage (short term)

* [ ] Add API tests for the three newly public endpoints returning 200/5xx (never 401/403).
* [ ] Add a **basic WebSocket test** (connects; receives message or ping/pong).
* [ ] Add a **Cypress/Playwright** smoke test:

  * Visit `/` → **Dashboard** renders (no login).
  * Basic widgets render without errors.

### 6) Pre-Prod Checklist (before any public URL)

* [ ] Restore **minimal auth** (even a simple password gate or reverse proxy auth).
* [ ] Confirm **TLS** (HTTPS), strict CORS, rate limits, and headers.
* [ ] Infrastructure: enable **logging, metrics, and alerts** on 5xx spikes & WS disconnects.
* [ ] Secrets come **only** from environment (no hardcoded values).

---

## Risks & Mitigations

* **Risk:** Unauthenticated data exposure
  **Mitigation:** Keep this mode in dev/staging; gate with VPN; do not expose to public internet.

* **Risk:** Downstream components assume `user` exists
  **Mitigation:** `Dashboard` props made optional; audit any places that still expect `user` shape — provide sensible defaults.

---

## Rollback Plan

1. Re-add `/login` route in `App.tsx`.
2. Reinstate guards:

   ```ts
   const isAuth = !!localStorage.getItem('token');
   if (!isAuth) return <Navigate to="/login" replace />;
   ```
3. Reapply `Depends(get_current_user)` on protected endpoints.
4. Redeploy; confirm `/` → **login** and protected endpoints return **401** without token.

---

## Suggested Follow-up Tickets

1. **FEAT:** Add `VITE_REQUIRE_LOGIN` / `PUBLIC_MODE` feature-flag plumbing (FE & BE).
2. **CHORE:** Extend CI with secret scan, lint, and a minimal E2E smoke.
3. **SEC:** Add security headers + rate limiting middleware by default.
4. **DOCS:** Clearly document Dev vs Prod modes and risks.
