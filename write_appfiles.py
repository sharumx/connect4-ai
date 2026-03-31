#!/usr/bin/env python3
"""Append TTT CSS to App.css and overwrite App.tsx."""
import os

base = os.path.expanduser("~/connect4-ai/src")

# ── 1. Append TTT CSS ─────────────────────────────────────────────────────────
ttt_css = """
/* ═══ Tic-Tac-Toe board ══════════════════════════════════════════════════════ */
.ttt-grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  grid-template-rows:    repeat(3, 100px);
  gap: 6px;
  padding: 12px;
  background: var(--board-bg);
  border-radius: 14px;
  box-shadow: 0 6px 28px rgba(0,0,0,.5);
}

.ttt-no-hover .ttt-cell { cursor: default; }

.ttt-cell {
  width: 100px; height: 100px;
  border-radius: 12px;
  background: var(--cell-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  box-shadow: inset 0 3px 8px rgba(0,0,0,.45);
  transition: background 0.12s;
}

.ttt-cell:not(.p1):not(.p2):hover {
  background: rgba(255,255,255,0.08);
}

/* X mark */
.ttt-cell.p1::before,
.ttt-cell.p1::after {
  content: '';
  position: absolute;
  width: 62px; height: 7px;
  border-radius: 4px;
  background: radial-gradient(circle, #f87171, #b91c1c);
  box-shadow: 0 2px 8px rgba(0,0,0,.3);
}
.ttt-cell.p1::before { transform: rotate(45deg); }
.ttt-cell.p1::after  { transform: rotate(-45deg); }

/* O mark */
.ttt-cell.p2::before {
  content: '';
  position: absolute;
  width: 62px; height: 62px;
  border-radius: 50%;
  border: 7px solid;
  border-color: #fde047;
  background: transparent;
  box-shadow:
    0 0 0 1px #a16207,
    inset 0 0 0 1px #a16207,
    0 2px 8px rgba(0,0,0,.35);
}

.ttt-cell.winning {
  box-shadow:
    inset 0 2px 6px rgba(0,0,0,.3),
    0 0 0 2px rgba(255,255,255,.4);
  animation: winPop 0.55s ease-in-out infinite;
}

/* ── Game-type tabs ─────────────────────────────────────────────────────────── */
.game-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 18px;
}

.game-tab {
  padding: 8px 22px;
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 24px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.game-tab:hover {
  border-color: rgba(255,255,255,0.3);
  color: var(--text);
}

.game-tab.active {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.45);
  color: var(--text);
}

@media (max-width: 760px) {
  .ttt-grid {
    grid-template-columns: repeat(3, 80px);
    grid-template-rows:    repeat(3, 80px);
  }
  .ttt-cell { width: 80px; height: 80px; }
  .ttt-cell.p1::before,
  .ttt-cell.p1::after { width: 48px; }
  .ttt-cell.p2::before { width: 48px; height: 48px; }
}
"""

with open(os.path.join(base, "App.css"), "a") as f:
    f.write(ttt_css)
print("Appended TTT CSS to App.css")

# ── 2. Overwrite App.tsx ──────────────────────────────────────────────────────
app_tsx = """\
import { useGame } from "./hooks/useGame";
import Board from "./components/Board";
import TttBoard from "./components/TttBoard";
import GameInfo from "./components/GameInfo";
import DifficultySelector from "./components/DifficultySelector";
import GameModeSelector from "./components/GameModeSelector";
import StatsPanel from "./components/Stats";
import "./App.css";

export default function App() {
  const {
    gameType,    setGameType,
    gameState,   difficulty,  setDifficulty,
    gameMode,    setGameMode,
    stats,       resetStats,
    isAiThinking, wasmReady,
    makeMove,    resetGame,
  } = useGame();

  const isOver = gameState.status !== "playing";

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          {gameType === "connect4" ? (
            <>
              <span className="disc red" />
              Connect 4
              <span className="disc yellow" />
            </>
          ) : (
            <>✕ Tic-Tac-Toe ○</>
          )}
        </h1>
        <p className="app-sub">Minimax AI with Alpha-Beta Pruning</p>
      </header>

      {/* Game-type selector */}
      <div className="game-tabs">
        <button
          className={`game-tab${gameType === "connect4" ? " active" : ""}`}
          onClick={() => setGameType("connect4")}
        >
          🔴 Connect 4
        </button>
        <button
          className={`game-tab${gameType === "ttt" ? " active" : ""}`}
          onClick={() => setGameType("ttt")}
        >
          ✕ Tic-Tac-Toe
        </button>
      </div>

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

          {gameType === "connect4" ? (
            <Board
              gameState={gameState}
              onColumnClick={makeMove}
              isAiThinking={isAiThinking}
            />
          ) : (
            <TttBoard
              gameState={gameState}
              onCellClick={(r, c) => makeMove(r, c)}
              isAiThinking={isAiThinking}
            />
          )}

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
        C++ Minimax · α-β Pruning ·{" "}
        {wasmReady ? "⚡ WebAssembly" : "🟨 TypeScript AI"}
      </footer>
    </div>
  );
}
"""

with open(os.path.join(base, "App.tsx"), "w") as f:
    f.write(app_tsx)
print("Wrote App.tsx")
