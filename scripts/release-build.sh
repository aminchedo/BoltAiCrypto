#!/bin/bash
# HTS Trading Dashboard v1.0.0 - Deterministic Build Script
# Generates production build with SHA256 checksums for artifact verification

set -e  # Exit on error

echo "🚀 HTS Trading Dashboard - Release Build Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run from project root."
  exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Error: Node.js 18+ required. Current: $(node -v)"
  exit 1
fi

# Step 1: Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist dist.SHA256.txt
echo "✅ Cleaned"
echo ""

# Step 2: Install dependencies (deterministic)
echo "📦 Installing dependencies (deterministic via package-lock.json)..."
npm ci
echo "✅ Dependencies installed"
echo ""

# Step 3: Run type checking
echo "🔍 Running TypeScript type checking..."
npm run typecheck
echo "✅ Type checking passed"
echo ""

# Step 4: Build production bundle
echo "🔨 Building production bundle..."
BUILD_START=$(date +%s)
npm run build
BUILD_END=$(date +%s)
BUILD_TIME=$((BUILD_END - BUILD_START))
echo "✅ Build completed in ${BUILD_TIME}s"
echo ""

# Step 5: Generate SHA256 checksums
echo "🔐 Generating SHA256 checksums..."
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found after build"
  exit 1
fi

# Create checksums for all files in dist
cd dist
find . -type f -exec shasum -a 256 {} \; | sort > ../dist.SHA256.txt
cd ..

# Count files
FILE_COUNT=$(wc -l < dist.SHA256.txt | xargs)
echo "✅ Generated checksums for $FILE_COUNT files"
echo ""

# Step 6: Display build summary
echo "📊 Build Summary"
echo "================"
echo "Version:        v1.0.0"
echo "Build time:     ${BUILD_TIME}s"
echo "Files:          $FILE_COUNT"
echo "Checksums:      dist.SHA256.txt"
echo "Bundle dir:     dist/"
echo ""

# Calculate total dist size
DIST_SIZE=$(du -sh dist | cut -f1)
echo "Bundle size:    $DIST_SIZE"
echo ""

# Display first few checksums as verification
echo "📝 Sample checksums (first 5 files):"
head -5 dist.SHA256.txt
echo ""

echo "✅ Build complete and verified!"
echo ""
echo "Next steps:"
echo "1. Review dist.SHA256.txt for artifact verification"
echo "2. Deploy dist/ directory to production"
echo "3. Attach dist.SHA256.txt to GitHub release"
echo ""
