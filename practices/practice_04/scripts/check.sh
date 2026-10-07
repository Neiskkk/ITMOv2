#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$PROJECT_DIR"

pass=true

function err() { echo "[check] $1" >&2; }

echo "[check] Running static checks for practice_04"

# 1) Required files
missing=()
for f in index.html styles.css script.js; do
  if [[ ! -f "$f" ]]; then
    missing+=("$f")
  fi
done

if (( ${#missing[@]} > 0 )); then
  err "Missing required files: ${missing[*]}"
  pass=false
else
  echo "[check] Required files present"
fi

# 2) node --check script.js (require node)
if ! command -v node >/dev/null 2>&1; then
  err "Node.js is not installed; cannot run node --check"
  pass=false
else
  if node --check script.js >/dev/null 2>&1; then
    echo "[check] JS syntax OK (node --check)"
  else
    err "node --check reported syntax errors in script.js"
    pass=false
  fi
fi

if [[ "$pass" == true ]]; then
  echo "PASS"
  exit 0
else
  echo "FAIL"
  exit 1
fi
