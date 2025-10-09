#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🎨 Formatting Java files..."
find ./api -path ./target -prune -o -name "*.java" -print0 | xargs -0 google-java-format -i

echo "🎨 Formatting JavaScript/JSX files..."
bunx @biomejs/biome check --write --unsafe ./frontend/src

echo "✅ Formatting complete!"
