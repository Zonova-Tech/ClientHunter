#!/usr/bin/env bash
# Pre-commit secret scanner. Refuses commits that contain common API key /
# credential patterns. Run automatically if installed as .git/hooks/pre-commit.
#
# Install once:
#   bash scripts/install-hooks.sh
#
# Bypass for a one-off (NOT recommended):
#   git commit --no-verify

set -euo pipefail

# Get staged file list, excluding deletions. Empty list → nothing to scan.
STAGED=$(git diff --cached --name-only --diff-filter=ACMR || true)
if [ -z "$STAGED" ]; then
  exit 0
fi

# Files we never want to scan (binaries, docs with intentional examples).
SKIP_PATHS_REGEX='(^|/)(node_modules|dist|lib|\.git)(/|$)|\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|lock|map)$'

# Patterns to flag. Keep these tight to avoid false positives.
# Each line is: pattern_regex|description
PATTERNS=(
  'AIza[0-9A-Za-z_\-]{35}|Google API key (AIza...)'
  'AKIA[0-9A-Z]{16}|AWS access key id (AKIA...)'
  'ghp_[A-Za-z0-9]{36}|GitHub personal access token (ghp_...)'
  'gho_[A-Za-z0-9]{36}|GitHub OAuth token (gho_...)'
  'sk_live_[a-zA-Z0-9]{24}|Stripe live secret key (sk_live_...)'
  'sk_test_[a-zA-Z0-9]{24}|Stripe test secret key (sk_test_...)'
  'xox[baprs]-[A-Za-z0-9-]{10,}|Slack token (xox.-...)'
  '-----BEGIN[^-]{0,30}PRIVATE KEY-----|Private key file content'
  'sk-ant-[A-Za-z0-9_-]{20,}|Anthropic API key (sk-ant-...)'
)

FOUND=0
REPORT=""

while IFS= read -r file; do
  # Skip if file matches skip regex.
  if echo "$file" | grep -qE "$SKIP_PATHS_REGEX"; then
    continue
  fi
  # Skip files that are explicitly allowed to contain example secrets.
  case "$file" in
    .env.example | .env.production | *.md | scripts/pre-commit-secret-scan.sh)
      continue
      ;;
  esac
  # Only scan if file exists (could be a rename target).
  [ -f "$file" ] || continue

  for pat_desc in "${PATTERNS[@]}"; do
    pat="${pat_desc%%|*}"
    desc="${pat_desc##*|}"
    if matches=$(git diff --cached -U0 -- "$file" | grep -nE "^\+" | grep -nE -e "$pat" || true); [ -n "$matches" ]; then
      FOUND=1
      REPORT+=$'\n'"  ❌  $file"$'\n'"      ($desc)"$'\n'
      while IFS= read -r line; do
        REPORT+="      → $(echo "$line" | head -c 200)"$'\n'
      done <<<"$matches"
    fi
  done
done <<<"$STAGED"

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "=========================================================="
  echo "  Pre-commit secret scan FAILED — staged content matches"
  echo "  a known secret pattern:"
  echo "=========================================================="
  echo -e "$REPORT"
  echo "  Options:"
  echo "    1. Remove the secret from the staged content."
  echo "    2. Move it to .env (gitignored) or Firebase Secret Manager."
  echo "    3. If false positive, edit scripts/pre-commit-secret-scan.sh"
  echo "       to skip the file."
  echo "    4. To bypass once (ONLY if you're sure): git commit --no-verify"
  echo ""
  exit 1
fi

exit 0
