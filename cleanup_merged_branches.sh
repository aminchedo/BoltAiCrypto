#!/bin/bash
# Branch Cleanup Script for BoltAiCrypto
# This script deletes merged remote branches safely

set -e

echo "🧹 Starting branch cleanup process..."
echo "================================================"

# Set GitHub token
export GH_TOKEN="ghs_s3MpwT8ydfRBD2sqZRhP1Ey0XnszaX293Lrf"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# List of merged branches to delete
MERGED_BRANCHES=(
    "cursor/analyze-login-connection-refused-error-cba3"
    "cursor/bc-8e038522-a663-4a5b-8f54-2e78bbc2ca4f-699d"
    "cursor/bc-d55183a3-5d49-4418-a3ba-b3aac3cee01b-a166"
    "cursor/bypass-login-for-direct-dashboard-access-36ff"
    "cursor/fix-production-deployment-issues-645b"
    "cursor/implement-and-enhance-aismarthts-trading-system-a190"
    "cursor/implement-and-enhance-coding-phase-three-7104"
    "cursor/implement-and-enhance-trading-system-phases-54b6"
    "cursor/implement-and-enhance-trading-system-phases-9582"
    "cursor/implement-full-crypto-trading-system-with-real-time-features-c7fa"
    "cursor/implement-high-frequency-trading-system-807c"
    "cursor/main2voltai"
)

# List of closed (not merged) branches to potentially delete
CLOSED_BRANCHES=(
    "cursor/implement-auth-less-development-mode-and-security-hardening-0384"
    "cursor/remove-login-and-direct-dashboard-access-ab00"
)

echo -e "${YELLOW}📊 Summary:${NC}"
echo "  - Merged branches to delete: ${#MERGED_BRANCHES[@]}"
echo "  - Closed (not merged) branches: ${#CLOSED_BRANCHES[@]}"
echo ""

# Function to delete a remote branch
delete_branch() {
    local branch=$1
    local branch_type=$2
    
    echo -e "${YELLOW}Processing: ${branch}${NC}"
    
    # Check if branch exists
    if git ls-remote --heads origin "$branch" | grep -q "$branch"; then
        if git push origin --delete "$branch" 2>/dev/null; then
            echo -e "${GREEN}✅ Deleted $branch_type branch: $branch${NC}"
            return 0
        else
            echo -e "${RED}❌ Failed to delete: $branch${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Branch does not exist: $branch${NC}"
        return 0
    fi
}

# Delete merged branches
echo -e "\n${GREEN}🗑️  Deleting merged branches...${NC}"
echo "================================================"
DELETED_COUNT=0
FAILED_COUNT=0

for branch in "${MERGED_BRANCHES[@]}"; do
    if delete_branch "$branch" "merged"; then
        ((DELETED_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
done

# Delete closed (not merged) branches
echo -e "\n${YELLOW}🗑️  Deleting closed (not merged) branches...${NC}"
echo "================================================"

for branch in "${CLOSED_BRANCHES[@]}"; do
    if delete_branch "$branch" "closed"; then
        ((DELETED_COUNT++))
    else
        ((FAILED_COUNT++))
    fi
done

# Clean up local references
echo -e "\n${YELLOW}🧹 Cleaning up local references...${NC}"
git fetch --prune

# Summary
echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}✨ Cleanup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo -e "  ${GREEN}✅ Successfully deleted: $DELETED_COUNT branches${NC}"
if [ $FAILED_COUNT -gt 0 ]; then
    echo -e "  ${RED}❌ Failed to delete: $FAILED_COUNT branches${NC}"
fi

# Show remaining branches
echo -e "\n${YELLOW}📋 Remaining remote branches:${NC}"
git branch -r | grep -v "HEAD" | sed 's/origin\//  - /'

echo -e "\n${GREEN}Done! ✨${NC}"
