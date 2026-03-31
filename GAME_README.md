# Connect 4 — AI Opponent

A full-stack browser game with a C++ Minimax AI opponent, compiled to **WebAssembly** or run via a TypeScript fallback.

## Features

| Feature          | Details                                              |
| ---------------- | ---------------------------------------------------- |
| **Game**         | Connect 4 — 7×6 board, gravity, 4-in-a-row wins      |
| **AI algorithm** | Minimax + α-β pruning, center-column heuristic       |
| **Difficulty**   | Easy (depth 2) · Medium (depth 4) · Hard (depth 7)   |
| **AI runtime**   | WebAssembly (C++) with automatic TypeScript fallback |
| **Non-blocking** | AI runs in a Web Worker — UI never freezes           |
| **Modes**        | Player vs AI · Player vs Player                      |
| **Sound**        | Web Audio API synthesised effects — no files needed  |
| **Stats**        | Win / loss / draw tracking with localStorage         |
| **Animation**    | Physics-accurate piece-drop animation                |

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

The TypeScript AI is active by default.

## Optional: compile C++ → WebAssembly

Install [Emscripten](https://emscripten.org/docs/getting_started/downloads.html), then:

```bash
source /path/to/emsdk/emsdk_env.sh
npm run build:wasm        # writes public/wasm/connect4.{js,wasm}
npm run dev               # app auto-detects WASM and shows ⚡ badge
```

## Project structure

```
connect4-ai/
├── cpp/                      C++ source (game logic + AI + WASM bindings)
│   ├── connect4.hpp / .cpp   Board, moves, win detection
│   ├── ai.hpp / .cpp         Minimax + alpha-beta pruning
│   └── bindings.cpp          Emscripten EMBIND glue
├── src/
│   ├── types/game.ts         Shared TypeScript types
│   ├── lib/
│   │   ├── connect4-engine.ts  Pure game logic (mirrors C++)
│   │   ├── connect4-ai.ts      TypeScript Minimax (fallback)
│   │   ├── wasm-loader.ts      Dynamic WASM module loader
│   │   └── sound.ts            Web Audio synthesiser
│   ├── workers/ai-worker.ts  Minimax in a Dedicated Worker
│   ├── hooks/useGame.ts      Central game-state hook
│   └── components/           React UI components
└── public/wasm/              Compiled WASM output (gitignored)
```

## AI algorithm

```
getBestMove(board, depth):
  for each valid column (centre-out order):
    drop piece → call minimax(depth-1, -∞, +∞, minimising)
    undo piece
  return column with highest score

minimax(board, depth, α, β, maximising):
  if terminal or depth == 0: return evaluate(board)
  for each move (centre-out):
    apply / undo move
    propagate score, update α / β
    if α ≥ β: prune remaining siblings   ← alpha-beta cutoff
```

The evaluation function scores every window of 4 consecutive cells in all directions, penalises opponent threats, and adds a centre-column bonus.

## Build for production

```bash
npm run build          # outputs to dist/
npm run preview        # serve the built app
```
