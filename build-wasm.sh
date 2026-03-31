#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# build-wasm.sh  —  Compile C++ AI to WebAssembly via Emscripten.
#
# The React app works perfectly WITHOUT this step (TypeScript fallback AI).
# Run this script once to upgrade the AI to native WASM speed.
#
# Prerequisites:
#   git clone https://github.com/emscripten-core/emsdk.git
#   cd emsdk && ./emsdk install latest && ./emsdk activate latest
#   source ./emsdk_env.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

if ! command -v emcc &>/dev/null; then
  echo ""
  echo "❌  Emscripten (emcc) not found in PATH."
  echo ""
  echo "Install Emscripten:"
  echo "  git clone https://github.com/emscripten-core/emsdk.git"
  echo "  cd emsdk"
  echo "  ./emsdk install latest"
  echo "  ./emsdk activate latest"
  echo "  source ./emsdk_env.sh   # or emsdk_env.bat on Windows"
  echo ""
  echo "Then re-run:  bash build-wasm.sh"
  echo ""
  echo "The app will use the TypeScript AI fallback until WASM is compiled."
  echo ""
  exit 1
fi

echo "🔨  Compiling C++ → WebAssembly…"
mkdir -p public/wasm

emcc \
  cpp/connect4.cpp \
  cpp/ai.cpp \
  cpp/bindings.cpp \
  -O3 \
  -std=c++17 \
  --bind \
  -s MODULARIZE=1 \
  -s EXPORT_NAME='createConnect4Module' \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s NO_EXIT_RUNTIME=1 \
  -s ASSERTIONS=0 \
  -s ENVIRONMENT='web,worker' \
  -o public/wasm/connect4.js

echo ""
echo "✅  Done!  Files written to public/wasm/"
echo "     public/wasm/connect4.js"
echo "     public/wasm/connect4.wasm"
echo ""
echo "Now run:  npm run dev"
echo ""
