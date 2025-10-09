#!/bin/bash

find ./api -path ./target -prune -o -name "*.java" -print0 | xargs -0 google-java-format -i &&
bunx @biomejs/biome check --write --unsafe ./frontend/src/**/*.{js,jsx}
