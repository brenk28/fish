#!/usr/bin/env sh
set -eu

DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
DIST_DIR="$DIR/dist"
PORT=8181

if [ ! -d "$DIST_DIR" ]; then
  echo "dist/ not found. Run 'npm run build' first."
  exit 1
fi

python3 -m http.server "$PORT" --directory "$DIST_DIR" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

sleep 0.6

if command -v chromium >/dev/null 2>&1; then
  chromium --app="http://localhost:$PORT" --start-fullscreen
elif command -v chromium-browser >/dev/null 2>&1; then
  chromium-browser --app="http://localhost:$PORT" --start-fullscreen
else
  xdg-open "http://localhost:$PORT"
  wait "$SERVER_PID"
fi
