#!/bin/bash
# Create GitHub PR via REST API

GITHUB_TOKEN="${GITHUB_TOKEN:-ghs_xtDEjFyQiy11GNWCJExZ4vzoQ2mfw84BRzcP}"
REPO_OWNER="aminchedo"
REPO_NAME="BoltAiCrypto"
HEAD_BRANCH="cursor/integrate-real-time-agent-end-to-end-7469"
BASE_BRANCH="main"
TITLE="feat: Real-Time Agent Integration - Complete Implementation"

# Read PR body from file
BODY=$(cat PR_DESCRIPTION.md)

# Create PR
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${GITHUB_TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls \
  -d "{
    \"title\": \"${TITLE}\",
    \"body\": $(jq -Rs . <<< "$BODY"),
    \"head\": \"${HEAD_BRANCH}\",
    \"base\": \"${BASE_BRANCH}\"
  }"
