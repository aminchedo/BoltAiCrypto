#!/usr/bin/env node
/**
 * Link Integrity Checker
 * Ensures all internal links and routes are valid
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

interface LinkIssue {
  file: string;
  line: number;
  link: string;
  issue: string;
}

const issues: LinkIssue[] = [];

// Known valid routes in the application
const validRoutes = new Set([
  '/',
  '/dashboard',
  '/scanner',
  '/scanner2',
  '/strategy',
  '/signals',
  '/portfolio',
  '/pnl',
  '/backtest',
  '/analytics',
  '/notifications',
  '/apis',
  '/health',
  '/settings',
]);

// Check if a route is valid
function isValidRoute(route: string): boolean {
  // External links are OK
  if (route.startsWith('http://') || route.startsWith('https://')) {
    return true;
  }
  
  // Hash links and query params
  if (route.includes('#') || route.includes('?')) {
    const base = route.split(/[#?]/)[0];
    return validRoutes.has(base) || base === '';
  }
  
  return validRoutes.has(route);
}

// Extract links from file content
function extractLinks(content: string, file: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // React Router Link components: <Link to="...">
    const linkRegex = /<Link[^>]+to=["']([^"']+)["']/g;
    let match;
    
    while ((match = linkRegex.exec(line)) !== null) {
      const link = match[1];
      if (!isValidRoute(link)) {
        issues.push({
          file,
          line: index + 1,
          link,
          issue: 'Invalid or unknown route',
        });
      }
    }
    
    // href attributes in anchors
    const hrefRegex = /<a[^>]+href=["']([^"']+)["']/g;
    while ((match = hrefRegex.exec(line)) !== null) {
      const link = match[1];
      // Only check internal links (starting with /)
      if (link.startsWith('/') && !isValidRoute(link)) {
        issues.push({
          file,
          line: index + 1,
          link,
          issue: 'Invalid or unknown route',
        });
      }
    }
    
    // Navigate function calls: navigate('/...')
    const navigateRegex = /navigate\(['"]([^'"]+)['"]\)/g;
    while ((match = navigateRegex.exec(line)) !== null) {
      const link = match[1];
      if (!isValidRoute(link)) {
        issues.push({
          file,
          line: index + 1,
          link,
          issue: 'Invalid or unknown route',
        });
      }
    }
  });
}

// Main execution
async function main() {
  console.log('🔍 Checking link integrity...\n');
  
  try {
    // Find all TypeScript/TSX files
    const files = await glob('src/**/*.{ts,tsx}', { 
      ignore: ['**/*.test.ts', '**/*.test.tsx', '**/node_modules/**'],
      cwd: process.cwd(),
    });
    
    console.log(`Found ${files.length} files to check\n`);
    
    // Check each file
    files.forEach((file) => {
      try {
        const content = readFileSync(file, 'utf-8');
        extractLinks(content, file);
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    });
    
    // Report results
    if (issues.length === 0) {
      console.log('✅ All links are valid!');
      process.exit(0);
    } else {
      console.log(`❌ Found ${issues.length} link issue(s):\n`);
      issues.forEach(({ file, line, link, issue }) => {
        console.log(`  ${file}:${line}`);
        console.log(`    Link: ${link}`);
        console.log(`    Issue: ${issue}\n`);
      });
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during link check:', error);
    process.exit(1);
  }
}

main();
