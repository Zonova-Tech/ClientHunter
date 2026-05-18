#!/usr/bin/env bash
# Installs the pre-commit secret scanner as a local git hook.
# Run from the repo root: bash scripts/install-hooks.sh
#
# Hooks live in .git/hooks/ which is NOT version-controlled, so every clone
# needs this command once.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOK_SRC="$REPO_ROOT/scripts/pre-commit-secret-scan.sh"
HOOK_DEST="$REPO_ROOT/.git/hooks/pre-commit"

if [ ! -f "$HOOK_SRC" ]; then
  echo "❌  Source hook not found: $HOOK_SRC"
  exit 1
fi

cp "$HOOK_SRC" "$HOOK_DEST"
chmod +x "$HOOK_DEST"
echo "✅  Pre-commit secret scanner installed at .git/hooks/pre-commit"
echo "    Test it: git commit (will scan staged files)"
echo "    Bypass:  git commit --no-verify"
