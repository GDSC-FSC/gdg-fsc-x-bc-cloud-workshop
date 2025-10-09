#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🔨 Building API..."
cd api
./gradlew clean build -x test
cd ..

echo "🔨 Building Frontend..."
cd frontend
bun install
bun run build
cd ..

echo "✅ Build complete!"
