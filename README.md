# Connect 4 & Tic-Tac-Toe — AI Opponent

A browser-based implementation of two classic games, both with a built-in AI that actually puts up a fight. Built with React and TypeScript, with the AI logic written in C++ and compiled to WebAssembly.

🎮 **Play it here:** https://sharumx.github.io/connect4-ai

---

## Games

**Connect 4** — Drop pieces to connect four in a row before the AI does. Harder than it looks on higher difficulties.

**Tic-Tac-Toe** — The classic 3×3 game. On hard mode, the AI is genuinely unbeatable (it searches the full game tree).

---

## How the AI works

Both games use **Minimax with Alpha-Beta Pruning** — the same algorithm used in competitive chess engines, just scaled down.

The AI thinks ahead several moves, assumes you'll always play optimally against it, and picks whichever move gives it the best outcome. Alpha-beta pruning cuts off branches that can't possibly affect the result, which makes it fast enough to run in real time.

Difficulty controls how many moves ahead the AI looks:

| Difficulty | Connect 4 depth | Tic-Tac-Toe depth |
| ---------- | --------------- | ----------------- |
| Easy       | 2 moves         | 1 move            |
| Medium     | 4 moves         | 3 moves           |
| Hard       | 7 moves         | Full search       |

The AI logic is written in C++ and compiled to **WebAssembly** for extra speed. If WASM isn't available, it falls back to a TypeScript implementation automatically.

---

## Features

- Two games in one — switch between Connect 4 and Tic-Tac-Toe
- vs AI or vs Player (local two-player)
- Three difficulty levels
- Win/loss/draw stats tracked per game
- Light and dark mode
- Runs entirely in the browser — no backend, no server

---

## Running locally

```bash
git clone https://github.com/sharumx/connect4-ai.git
cd connect4-ai
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## Tech stack

- **React 19** + **TypeScript** — UI and game state
- **Vite** — build tool
- **C++ / WebAssembly** — AI engine (TypeScript fallback included)
- **Web Workers** — AI runs off the main thread so the UI never freezes
- **Web Audio API** — Sound effects, no audio files needed

---

## Deploying

```bash
npm run deploy
```

Builds and pushes to GitHub Pages automatically.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
