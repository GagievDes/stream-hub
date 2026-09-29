#!/usr/bin/env bash
# Copy Lumina source into the Windows home folder (no node_modules).
# Run from WSL:  bash scripts/sync-to-windows.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git pull --ff-only || git pull || true

WIN_USER="${1:-}"
if [[ -z "$WIN_USER" ]]; then
  WIN_USER="$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r' | tr -d ' ')"
fi
if [[ -z "$WIN_USER" || ! -d "/mnt/c/Users/$WIN_USER" ]]; then
  echo "Could not find Windows user folder. Pass your Windows username:"
  echo "  bash scripts/sync-to-windows.sh davit"
  exit 1
fi

DEST="/mnt/c/Users/$WIN_USER/stream-hub"
echo "Syncing to $DEST ..."

mkdir -p "$DEST"
# Drop broken installs copied from WSL earlier
rm -rf "$DEST/node_modules" "$DEST/.next"

# Plain tar — no rsync required
tar -cf - \
  --exclude=./node_modules \
  --exclude=./.next \
  --exclude=./.git \
  --exclude=./.env.local \
  --exclude=./dist \
  . | tar -C "$DEST" -xf -

# Keep / write API key on the Windows copy
if [[ ! -f "$DEST/.env.local" ]]; then
  printf 'TMDB_API_KEY=e568d7c77dd8fe416b1bb51b6f682466\n' > "$DEST/.env.local"
fi

echo
echo "Done. On Windows, open File Explorer to:"
echo "  C:\\Users\\$WIN_USER\\stream-hub"
echo "and double-click start-app.bat"
echo
