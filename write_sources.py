#!/usr/bin/env python3
"""Write all Connect-4 React source files that need to be created or overwritten."""
import os

ROOT = os.path.expanduser("~/connect4-ai/src")

files = {}

# ─── App.tsx ──────────────────────────────────────────────────────────────────
files["App.tsx"] = '''\
import { useGame } from "./hooks/useGame";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import DifficultySelector from "./components/DifficultySelector";
import GameModeSelector from "./components/GameModeSelector";
import StatsPanel from "./components/Stats";
import "./App.css";

export default function App() {
  const {
    gameState, difficulty, setDifficulty,
    gameMode, setGameMode,
    stats, resetStats,
    isAiThinking, wasmReady,
    makeMove, resetGame,
  } = useGame();

  const isOver = gameState.status !== "playing";

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="disc red" />
          Connect\u00a04
          <span className="disc yellow" />
        </h1>
        <p className="app-sub">Minimax AI with Alpha-Beta Pruning</p>
      </header>

      <div className="game-layout">
        <aside className="sidebar">
          {gameMode === "pvai" && (
            <StatsPanel stats={stats} onReset={resetStats} />
          )}
          <DifficultySelector
            difficulty={difficulty}
            onChange={setDifficulty}
            disabled={gameMode !== "pvai" || gameState.moveCount > 0}
          />
        </aside>

        <main className="main-area">
          <GameInfo
            gameState={gameState}
            isAiThinking={isAiThinking}
            gameMode={gameMode}
            wasmReady={wasmReady}
          />
          <Board
            gameState={gameState}
            onColumnClick={makeMove}
            isAiThinking={isAiThinking}
          />
          <div className="action-row">
            {isOver && (
              <button className="btn-primary" onClick={resetGame}>
                Play Again
              </button>
            )}
            {!isOver && gameState.moveCount > 0 && (
              <button className="btn-ghost" onClick={resetGame}>
                Restart
              </button>
            )}
          </div>
        </main>

        <aside className="sidebar">
          <GameModeSelector gameMode={gameMode} onChange={setGameMode} />
        </aside>
      </div>

      <footer className="app-footer">
        C++ Minimax\u00a0\u00b7\u00a0\u03b1-\u03b2 Pruning\u00a0\u00b7\u00a0
        {wasmReady ? "\u26a1 WebAssembly" : "\U0001f7e8 TypeScript AI"}
      </footer>
    </div>
  );
}
'''

# ─── index.css ────────────────────────────────────────────────────────────────
files["index.css"] = '''\
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:       #0d0d1a;
  --surface:  #161626;
  --border:   #2a2a4a;
  --text:     #e2e8f0;
  --muted:    #94a3b8;
  --accent:   #3b82f6;
  --p1:       #ef4444;
  --p1-glow:  rgba(239,68,68,0.55);
  --p2:       #eab308;
  --p2-glow:  rgba(234,179,8,0.55);
  --board:    #1e40af;
  --cell-bg:  #0d0d1a;
  --radius:   12px;
  font-family: "Segoe UI", system-ui, sans-serif;
}

html, body, #root { height: 100%; }

body {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

button { cursor: pointer; font-family: inherit; }
'''

# ─── App.css ──────────────────────────────────────────────────────────────────
files["App.css"] = '''\
/* ═══ Layout ═══════════════════════════════════════════════════════════════ */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 1rem;
}

.app-header {
  text-align: center;
  padding: 1.5rem 0 1rem;
}

.app-title {
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.disc {
  display: inline-block;
  width: 28px; height: 28px;
  border-radius: 50%;
  box-shadow: 0 0 10px 2px var(--shadow-color, rgba(0,0,0,.4));
}
.disc.red    { background: var(--p1); --shadow-color: var(--p1-glow); }
.disc.yellow { background: var(--p2); --shadow-color: var(--p2-glow); }

.app-sub {
  color: var(--muted);
  font-size: 0.85rem;
  margin-top: 0.3rem;
}

.game-layout {
  display: grid;
  grid-template-columns: 180px 1fr 180px;
  gap: 1.5rem;
  align-items: start;
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
}

.main-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
}

.app-footer {
  text-align: center;
  padding: 1rem 0 1.5rem;
  color: var(--muted);
  font-size: 0.78rem;
}

/* ═══ Panels ════════════════════════════════════════════════════════════════ */
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
}

.panel-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 0.75rem;
}

.panel-note {
  font-size: 0.7rem;
  color: var(--muted);
  margin-bottom: 0.5rem;
  font-style: italic;
}

/* ═══ Buttons ═══════════════════════════════════════════════════════════════ */
.btn-group { display: flex; gap: 0.4rem; }
.btn-group.vertical { flex-direction: column; }

.pill-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 500;
  transition: all 0.15s;
}
.pill-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text);
}
.pill-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.pill-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  padding: 0.65rem 2rem;
  font-size: 1rem;
  font-weight: 700;
  transition: opacity 0.15s, transform 0.1s;
}
.btn-primary:hover  { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:active { transform: translateY(0); }

.btn-ghost {
  background: transparent;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 1.5rem;
  font-size: 0.88rem;
  transition: border-color 0.15s, color 0.15s;
}
.btn-ghost:hover { border-color: var(--muted); color: var(--text); }

.ghost-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.72rem;
  text-decoration: underline;
  padding: 0.3rem 0;
  margin-top: 0.5rem;
  display: block;
}
.ghost-btn:hover { color: var(--text); }

.action-row {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  min-height: 2.5rem;
}

/* ═══ Stats panel ═══════════════════════════════════════════════════════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  background: var(--bg);
  border-radius: 8px;
  padding: 0.5rem 0.25rem;
  border: 1px solid var(--border);
}

.stat-num {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}
.stat-lbl {
  font-size: 0.65rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-box.win  .stat-num { color: #4ade80; }
.stat-box.loss .stat-num { color: var(--p1); }
.stat-box.draw .stat-num { color: var(--muted); }

.win-rate {
  font-size: 0.78rem;
  color: var(--muted);
  margin-bottom: 0.25rem;
}
.win-rate strong { color: var(--text); }

/* ═══ Legend ════════════════════════════════════════════════════════════════ */
.legend {
  margin-top: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}
.legend-dot {
  display: inline-block;
  width: 14px; height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}
.legend-dot.p1 { background: var(--p1); box-shadow: 0 0 6px var(--p1-glow); }
.legend-dot.p2 { background: var(--p2); box-shadow: 0 0 6px var(--p2-glow); }

/* ═══ Game info bar ══════════════════════════════════════════════════════════ */
.game-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 2.4rem;
}

.status-msg {
  font-size: 1rem;
  font-weight: 600;
}
.status-msg.terminal {
  font-size: 1.3rem;
  font-weight: 800;
}

@keyframes thinkPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}
.thinking-pulse { animation: thinkPulse 1s ease-in-out infinite; }

.wasm-badge {
  font-size: 0.68rem;
  font-weight: 700;
  background: #1e3a5f;
  color: #60a5fa;
  border: 1px solid #2563eb;
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  letter-spacing: 0.05em;
}

/* ═══ Board ══════════════════════════════════════════════════════════════════ */
.board-wrap {
  transition: opacity 0.2s;
}
.board-wrap.thinking { opacity: 0.92; }

.preview-row {
  display: flex;
  height: 44px;
  gap: 8px;
  padding: 0 12px;
  margin-bottom: 2px;
}
.preview-cell {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.preview-piece {
  width: 44px; height: 44px;
  border-radius: 50%;
  opacity: 0.55;
  transition: opacity 0.1s;
}
.preview-piece.p1 { background: var(--p1); }
.preview-piece.p2 { background: var(--p2); }

.board-grid {
  display: flex;
  gap: 8px;
  background: var(--board);
  border-radius: 16px;
  padding: 12px;
  box-shadow:
    0 10px 40px rgba(0,0,80,.6),
    inset 0 2px 4px rgba(255,255,255,.06);
}

.board-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  border-radius: 8px;
  padding: 2px;
  transition: background 0.12s;
}
.board-col.hovered { background: rgba(255,255,255,0.06); }

/* ═══ Cell & pieces ══════════════════════════════════════════════════════════ */
.cell {
  width: 60px; height: 60px;
  border-radius: 50%;
  background: var(--cell-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 3px 8px rgba(0,0,0,.5);
  overflow: hidden;
  position: relative;
}

.cell.winning {
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,.3),
    0 0 0 2px rgba(255,255,255,.35);
}

.piece {
  width: 52px; height: 52px;
  border-radius: 50%;
  position: absolute;
}

.piece.p1 {
  background: radial-gradient(circle at 36% 34%, #f87171, #b91c1c);
  box-shadow:
    0 2px 8px rgba(0,0,0,.35),
    inset 0 -2px 5px rgba(0,0,0,.2);
}
.piece.p2 {
  background: radial-gradient(circle at 36% 34%, #fde047, #a16207);
  box-shadow:
    0 2px 8px rgba(0,0,0,.35),
    inset 0 -2px 5px rgba(0,0,0,.2);
}

@keyframes dropIn {
  0%   { transform: translateY(calc(-1 * var(--drop-px, 350px))); }
  80%  { transform: translateY(4px); }
  91%  { transform: translateY(-3px); }
  100% { transform: translateY(0); }
}

.piece.just-placed {
  animation: dropIn calc(max(0.28s, var(--drop-px, 300px) / 1400px * 0.55s))
             cubic-bezier(0.35, 0, 0.65, 1) forwards;
}

@keyframes winPop {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.12); }
}
.piece.win-flash {
  animation: winPop 0.55s ease-in-out infinite;
}

/* ═══ Responsive ═════════════════════════════════════════════════════════════ */
@media (max-width: 760px) {
  .game-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  .sidebar { flex-direction: row; flex-wrap: wrap; }
  .panel   { flex: 1; min-width: 140px; }
  .cell    { width: 44px; height: 44px; }
  .piece   { width: 38px; height: 38px; }
  .preview-piece { width: 34px; height: 34px; }
}
'''

for rel, content in files.items():
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as fh:
        fh.write(content)
    print(f"  wrote {rel}")

print("Done.")
