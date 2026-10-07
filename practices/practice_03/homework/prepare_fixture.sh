#!/usr/bin/env bash
set -euo pipefail

# Determine repo root
ROOT_DIR=$(git rev-parse --show-toplevel)

# Create isolated temp directory under /tmp
TMP_DIR=$(mktemp -d /tmp/practice03-homework.XXXXXX)

# Copy root Makefile
cp -a "$ROOT_DIR/Makefile" "$TMP_DIR/Makefile"

# Copy practices/practice_01 preserving path inside tmp
mkdir -p "$TMP_DIR/practices"
cp -a "$ROOT_DIR/practices/practice_01" "$TMP_DIR/practices/"

# Compute SHA-256 manifest with relative paths (from TMP_DIR)
pushd "$TMP_DIR" >/dev/null
# List all files, sort, and hash
MANIFEST_PATH="$ROOT_DIR/practices/practice_03/homework/input_manifest.sha256"
find . -type f -print0 | sort -z | xargs -0 sha256sum > "$MANIFEST_PATH"
popd >/dev/null

# Output the temp directory path
echo "$TMP_DIR"
