import { useState, useEffect } from "react";
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

  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('light', !dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="app">
      <header className="app-header">
        <button
          className={`theme-toggle${dark ? ' theme-dark' : ' theme-light'}`}
          onClick={() => setDark(d => !d)}
          aria-label="Toggle light/dark mode"
        >
          <span className="theme-toggle-knob">
            {dark ? (
              // Crescent moon — grey
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#94a3b8" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
              </svg>
            ) : (
              // Sun — black
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#1e293b" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="21" x2="12" y2="23" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="1" y1="12" x2="3" y2="12" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="21" y1="12" x2="23" y2="12" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </span>
          <span className="theme-toggle-label">
            {dark ? 'NIGHT MODE' : 'DAY MODE'}
          </span>
        </button>
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
            gameType={gameType}
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
    </div>
  );
}
