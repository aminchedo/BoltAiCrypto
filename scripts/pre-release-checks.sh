#!/bin/bash
# HTS Trading Dashboard v1.0.0 - Pre-Release Verification Script
# Runs comprehensive checks before tagging and releasing

set -e

echo "🔍 HTS Trading Dashboard - Pre-Release Checks"
echo "=============================================="
echo ""

ERRORS=0
WARNINGS=0

# Helper functions
check_pass() {
  echo "  ✅ $1"
}

check_fail() {
  echo "  ❌ $1"
  ERRORS=$((ERRORS + 1))
}

check_warn() {
  echo "  ⚠️  $1"
  WARNINGS=$((WARNINGS + 1))
}

# Check 1: Git status
echo "1️⃣  Checking git status..."
if git diff-index --quiet HEAD --; then
  check_pass "Working tree clean"
else
  check_fail "Working tree has uncommitted changes"
fi
echo ""

# Check 2: Current branch
echo "2️⃣  Checking branch..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
  check_pass "On main branch"
else
  check_warn "Not on main branch (current: $CURRENT_BRANCH)"
fi
echo ""

# Check 3: Package.json version
echo "3️⃣  Checking package.json version..."
PACKAGE_VERSION=$(node -p "require('./package.json').version")
if [ "$PACKAGE_VERSION" = "1.0.0" ]; then
  check_pass "Version is 1.0.0"
else
  check_fail "Version mismatch (found: $PACKAGE_VERSION, expected: 1.0.0)"
fi
echo ""

# Check 4: Dependencies
echo "4️⃣  Checking dependencies..."
if npm run typecheck &> /dev/null; then
  check_pass "TypeScript compilation successful"
else
  check_fail "TypeScript compilation failed"
fi
echo ""

# Check 5: Build
echo "5️⃣  Checking build..."
if npm run build &> /dev/null; then
  check_pass "Production build successful"
else
  check_fail "Production build failed"
fi
echo ""

# Check 6: Required files
echo "6️⃣  Checking required files..."
REQUIRED_FILES=(
  "RELEASE_NOTES.md"
  "README.md"
  "package.json"
  "vite.config.ts"
  "tsconfig.json"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    check_pass "$file exists"
  else
    check_fail "$file missing"
  fi
done
echo ""

# Check 7: Environment template
echo "7️⃣  Checking environment configuration..."
if [ -f ".env.example" ]; then
  check_pass ".env.example exists"
  
  # Check required env vars
  REQUIRED_VARS=("VITE_API_BASE_URL" "VITE_WS_URL" "VITE_ENV")
  for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var" .env.example; then
      check_pass "$var documented in .env.example"
    else
      check_warn "$var not found in .env.example"
    fi
  done
else
  check_fail ".env.example missing"
fi
echo ""

# Check 8: ESLint
echo "8️⃣  Checking linting..."
LINT_OUTPUT=$(npm run lint 2>&1 || true)
if echo "$LINT_OUTPUT" | grep -q "0 errors"; then
  check_pass "No ESLint errors"
else
  check_fail "ESLint errors found"
fi

if echo "$LINT_OUTPUT" | grep -qE "[0-9]+ warnings"; then
  WARNING_COUNT=$(echo "$LINT_OUTPUT" | grep -oE "[0-9]+ warnings" | grep -oE "[0-9]+" || echo "0")
  check_warn "$WARNING_COUNT ESLint warnings (tracked for v1.0.1)"
fi
echo ""

# Summary
echo "📊 Pre-Release Check Summary"
echo "============================"
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
  echo "❌ Pre-release checks FAILED. Fix errors before releasing."
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo "⚠️  Pre-release checks PASSED with warnings."
  echo "Review warnings above. Continue? (y/n)"
  read -r response
  if [ "$response" != "y" ] && [ "$response" != "Y" ]; then
    echo "Release cancelled."
    exit 1
  fi
  echo "✅ Proceeding with release"
else
  echo "✅ All pre-release checks PASSED!"
fi
echo ""
