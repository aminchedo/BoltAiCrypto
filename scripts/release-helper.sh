#!/bin/bash
# HTS Trading Dashboard v1.0.0 - Release Helper Script
# Automates the release process (except git operations which must be manual)

set -e

VERSION="1.0.0"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  HTS Trading Dashboard v${VERSION} - Release Helper        ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Function to print section headers
print_section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

# Function to check status
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ $1${NC}"
    return 0
  else
    echo -e "${RED}❌ $1${NC}"
    return 1
  fi
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# =============================================================================
# PHASE 0: Pre-flight Checks
# =============================================================================

print_section "PHASE 0: Pre-flight Checks"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: package.json not found. Please run from project root.${NC}"
  exit 1
fi
check_status "Running from project root"

# Check git status
if ! git diff-index --quiet HEAD --; then
  warn "Working tree has uncommitted changes"
  echo "   Commit or stash changes before releasing"
  exit 1
fi
check_status "Working tree clean"

# Check branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  warn "Not on main branch (current: $CURRENT_BRANCH)"
  echo "   Switch to main before releasing: git checkout main"
  exit 1
fi
check_status "On main branch"

# Check if main is up to date
git fetch origin main
LOCAL=$(git rev-parse main)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
  warn "main branch is not up to date with origin"
  echo "   Pull latest changes: git pull --ff-only"
  exit 1
fi
check_status "Branch up to date with origin"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Error: Node.js 18+ required. Current: $(node -v)${NC}"
  exit 1
fi
check_status "Node.js version $(node -v)"

# Check package.json version
PACKAGE_VERSION=$(node -p "require('./package.json').version")
if [ "$PACKAGE_VERSION" != "$VERSION" ]; then
  echo -e "${RED}❌ Error: package.json version mismatch (found: $PACKAGE_VERSION, expected: $VERSION)${NC}"
  exit 1
fi
check_status "package.json version is $VERSION"

# =============================================================================
# PHASE 1: Run Pre-Release Checks
# =============================================================================

print_section "PHASE 1: Pre-Release Checks"

info "Running comprehensive pre-release checks..."
if [ -f "scripts/pre-release-checks.sh" ]; then
  bash scripts/pre-release-checks.sh
  check_status "Pre-release checks passed"
else
  warn "Pre-release check script not found"
fi

# =============================================================================
# PHASE 2: Build Production Bundle
# =============================================================================

print_section "PHASE 2: Build Production Bundle"

info "Building deterministic production bundle..."
if [ -f "scripts/release-build.sh" ]; then
  bash scripts/release-build.sh
  check_status "Production build completed"
else
  # Fallback if script doesn't exist
  npm ci
  npm run build
  cd dist && find . -type f -exec shasum -a 256 {} \; | sort > ../dist.SHA256.txt && cd ..
  check_status "Production build completed (fallback)"
fi

# =============================================================================
# PHASE 3: Generate Release Assets
# =============================================================================

print_section "PHASE 3: Generate Release Assets"

# Check if dist/ exists
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ Error: dist/ directory not found${NC}"
  exit 1
fi

# Calculate bundle size
DIST_SIZE=$(du -sh dist | cut -f1)
FILE_COUNT=$(find dist -type f | wc -l | xargs)

info "Bundle statistics:"
echo "  • Size: $DIST_SIZE"
echo "  • Files: $FILE_COUNT"
echo "  • Checksums: dist.SHA256.txt"

# Show sample checksums
echo ""
info "Sample checksums (first 3 files):"
head -3 dist.SHA256.txt | sed 's/^/  /'

check_status "Release assets generated"

# =============================================================================
# PHASE 4: Git Tag Instructions
# =============================================================================

print_section "PHASE 4: Git Tag & Release (Manual)"

echo -e "${YELLOW}⚠️  The following steps must be done manually:${NC}"
echo ""
echo "1️⃣  Create git tag:"
echo -e "   ${BLUE}git tag -a v${VERSION} -m \"HTS Trading Dashboard v${VERSION} — production-ready\"${NC}"
echo ""
echo "2️⃣  Push tag to remote:"
echo -e "   ${BLUE}git push origin v${VERSION}${NC}"
echo ""
echo "3️⃣  Create GitHub Release:"
echo "   • Go to: https://github.com/$(git config --get remote.origin.url | sed 's/.*:\(.*\)\.git/\1/')/releases/new"
echo "   • Tag: v${VERSION}"
echo "   • Title: HTS Trading Dashboard v${VERSION}"
echo "   • Body: Copy from RELEASE_NOTES.md"
echo "   • Attach: dist.SHA256.txt"
echo ""

# =============================================================================
# PHASE 5: Deployment Checklist
# =============================================================================

print_section "PHASE 5: Deployment Checklist"

echo "Before deploying to production:"
echo ""
echo "Environment Variables:"
echo "  [ ] VITE_API_BASE_URL set"
echo "  [ ] VITE_WS_URL set"
echo "  [ ] VITE_ENV=production"
echo "  [ ] VITE_DEBUG=false"
echo "  [ ] API keys configured"
echo ""
echo "Deployment:"
echo "  [ ] Point deploy to main@$(git rev-parse --short HEAD) (v${VERSION})"
echo "  [ ] Upload dist/ to hosting provider"
echo "  [ ] Purge CDN cache (if applicable)"
echo "  [ ] Verify health checks pass"
echo ""
echo "Post-Deployment:"
echo "  [ ] Run smoke tests (see SMOKE_TESTS.md)"
echo "  [ ] Check monitoring dashboards"
echo "  [ ] Verify no console errors"
echo "  [ ] Test on multiple browsers"
echo ""

# =============================================================================
# PHASE 6: Monitoring Setup
# =============================================================================

print_section "PHASE 6: Monitoring Setup (Recommended)"

echo "Set up monitoring (see MONITORING_AND_ROLLBACK.md):"
echo ""
echo "  [ ] Error tracking (Sentry)"
echo "  [ ] Uptime monitoring (UptimeRobot)"
echo "  [ ] Analytics (Plausible/Umami)"
echo "  [ ] API monitoring (logs/APM)"
echo "  [ ] Alert notifications (email/Slack)"
echo ""

# =============================================================================
# PHASE 7: Post-Release Tasks
# =============================================================================

print_section "PHASE 7: Post-Release Tasks"

echo "After successful deployment:"
echo ""
echo "  [ ] Run full smoke tests (SMOKE_TESTS.md)"
echo "  [ ] Monitor for 24-48 hours (see MONITORING_AND_ROLLBACK.md)"
echo "  [ ] Create v1.0.1 milestone for improvements"
echo "  [ ] Open ESLint warnings tracking issue"
echo "  [ ] Capture resolution screenshots (1366×768, 1440×900)"
echo "  [ ] Document any deployment learnings"
echo ""

# =============================================================================
# Summary
# =============================================================================

print_section "Release Preparation Complete!"

echo -e "${GREEN}✅ All automated checks passed!${NC}"
echo ""
echo "Release artifacts ready:"
echo "  • dist/ (production bundle)"
echo "  • dist.SHA256.txt (checksums)"
echo "  • RELEASE_NOTES.md (release content)"
echo ""
echo -e "${BLUE}Next step: Follow Phase 4 instructions above to create git tag and GitHub release${NC}"
echo ""
echo -e "${YELLOW}Need help?${NC}"
echo "  • Smoke tests: see SMOKE_TESTS.md"
echo "  • Monitoring: see MONITORING_AND_ROLLBACK.md"
echo "  • Rollback: see MONITORING_AND_ROLLBACK.md section 5"
echo ""
echo -e "${GREEN}🚀 Ready to ship v${VERSION}!${NC}"
echo ""
