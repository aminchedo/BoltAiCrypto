---
name: ESLint Warnings Reduction
about: Track incremental ESLint warning fixes for code quality improvement
title: '[ESLint] Fix warnings in [folder/component]'
labels: code-quality, eslint, tech-debt
assignees: ''
---

## 📋 Overview

**Folder/Component**: [e.g., `src/components/Scanner`]  
**Current Warning Count**: [e.g., 23 warnings]  
**Target**: 0 warnings  
**Priority**: Low (quality improvement, not blocking)

---

## 🎯 Goals

This issue tracks ESLint warning fixes for **[folder/component name]**. 

**Why this matters**:
- Improves code maintainability
- Catches potential bugs early
- Maintains consistent code style
- Makes future PRs cleaner

**Scope**: Fix warnings in a **single folder/component** only (max 50 fixes per PR for reviewability).

---

## 📊 Current Warnings Breakdown

Run the following to see current warnings:

```bash
npm run lint -- --max-warnings 0 [folder/path]
```

**Common warning types** (fill in after running lint):
- [ ] `no-unused-vars`: [count]
- [ ] `@typescript-eslint/no-explicit-any`: [count]
- [ ] `react-hooks/exhaustive-deps`: [count]
- [ ] `@typescript-eslint/no-unused-expressions`: [count]
- [ ] Other: [count]

---

## ✅ Tasks

### Step 1: Analyze Warnings
- [ ] Run `npm run lint -- [folder/path]` to see full list
- [ ] Group warnings by type
- [ ] Identify quick wins vs complex fixes
- [ ] Check for false positives (use `eslint-disable-next-line` sparingly)

### Step 2: Fix Warnings
- [ ] Fix all `no-unused-vars` (remove or use them)
- [ ] Fix all `@typescript-eslint/no-explicit-any` (add proper types)
- [ ] Fix all `react-hooks/exhaustive-deps` (add missing deps or justify)
- [ ] Fix remaining warnings

### Step 3: Verify
- [ ] Run `npm run lint -- [folder/path]` again
- [ ] Confirm 0 warnings in target folder
- [ ] Run `npm run typecheck` to ensure no TypeScript errors
- [ ] Test affected components manually

### Step 4: PR
- [ ] Create PR with clear title: "fix(eslint): Resolve warnings in [folder]"
- [ ] Link this issue in PR description
- [ ] Request review

---

## 🚫 Rules to Follow

1. **No logic changes**: Only fix linting issues, don't refactor functionality
2. **Test affected code**: Ensure no regressions
3. **Don't disable rules**: Fix the root cause, don't silence warnings (unless absolutely justified)
4. **One folder at a time**: Don't mix fixes from multiple folders
5. **Keep PRs reviewable**: Max 50 fixes per PR

---

## 📝 Notes

Add any special considerations:
- Components that need manual testing
- Warnings that need discussion (false positives?)
- Files in `/archive` can be ignored (already in .eslintignore)

---

## 🔗 Related

- Parent tracking issue: #[number] (v1.0.1 ESLint Cleanup)
- ESLint config: `eslint.config.js`
- Current warning count (baseline): 236

---

## ✅ Definition of Done

- [ ] All warnings fixed in target folder
- [ ] `npm run lint -- [folder/path]` shows 0 warnings
- [ ] No new TypeScript errors
- [ ] Components tested manually
- [ ] PR merged
- [ ] Issue closed

---

**Priority**: P3 (Low - quality improvement)  
**Estimated effort**: [1-3 hours depending on folder size]  
**Reviewer**: [Assign reviewer]
