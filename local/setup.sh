#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
python3 -m venv "$ROOT/.venv"
"$ROOT/.venv/bin/pip" install -r "$ROOT/requirements.txt"
npm ci --prefix "$ROOT/local"
echo 'Local dependencies ready. No PipeOps login, project or hosting is needed.'
