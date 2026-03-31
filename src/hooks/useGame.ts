/**
 * useGame.ts
 * Central game-state hook — supports both Connect-4 and Tic-Tac-Toe.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Difficulty, GameMode, GameState, GameType, Stats } from '../types/game';

// ── Connect-4 ─────────────────────────────────────────────────────────────────
import {
  INITIAL_STATE as C4_INITIAL, PLAYER, AI,
  applyMove as c4Apply, applyMovePvP as c4ApplyPvP,
  isValidMove as c4IsValidMove,
} from '../lib/connect4-engine';
import { DIFFICULTY_DEPTH } from '../lib/connect4-ai';
import { loadWasm, wasmGetBestMove, isWasmLoaded } from '../lib/wasm-loader';

// ── Tic-Tac-Toe ───────────────────────────────────────────────────────────────
import {
  TTT_INITIAL_STATE, TTT_P1, TTT_P2,
  tttApplyMove, tttIsValidMove,
} from '../lib/ttt-engine';
import { TTT_DIFFICULTY_DEPTH } from '../lib/ttt-ai';

// ── Shared ────────────────────────────────────────────────────────────────────
import { playDrop, playWin, playLose, playDraw, resumeAudio } from '../lib/sound';
import AIWorker from '../workers/ai-worker?worker';

// ─── Stats persistence ────────────────────────────────────────────────────────
function statsKey(gt: GameType) { return `connect4_stats_${gt}`; }

function loadStats(gt: GameType): Stats {
  try {
    const raw = localStorage.getItem(statsKey(gt));
    if (raw) return JSON.parse(raw) as Stats;
  } catch { /* ignore */ }
  return { wins: 0, losses: 0, draws: 0 };
}

function saveStats(gt: GameType, s: Stats) {
  try { localStorage.setItem(statsKey(gt), JSON.stringify(s)); } catch { /* ignore */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useGame() {
  const [gameType,     setGameTypeState] = useState<GameType>('connect4');
  const [gameState,    setGameState]     = useState<GameState>(C4_INITIAL);
  const [difficulty,   setDifficulty]    = useState<Difficulty>('medium');
  const [gameMode,     setGameMode]      = useState<GameMode>('pvai');
  const [stats,        setStats]         = useState<Stats>(() => loadStats('connect4'));
  const [isAiThinking, setIsAiThinking]  = useState(false);
  const [wasmReady,    setWasmReady]     = useState(false);

  // Stable refs for use inside callbacks / effects
  const gameStateRef  = useRef(gameState);  gameStateRef.current  = gameState;
  const difficultyRef = useRef(difficulty); difficultyRef.current = difficulty;
  const gameModeRef   = useRef(gameMode);   gameModeRef.current   = gameMode;
  const gameTypeRef   = useRef(gameType);   gameTypeRef.current   = gameType;

  // ── Web Worker ──────────────────────────────────────────────────────────────
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new AIWorker();

    worker.onmessage = ({ data }: MessageEvent<{ col: number; row?: number }>) => {
      const state = gameStateRef.current;
      let newState: GameState;

      if (gameTypeRef.current === 'ttt') {
        newState = tttApplyMove(state, data.row!, data.col);
      } else {
        newState = c4Apply(state, data.col);
      }

      setGameState(newState);
      setIsAiThinking(false);
      playDrop();

      if      (newState.status === 'ai-won') playLose();
      else if (newState.status === 'draw')   playDraw();
    };

    worker.onerror = (e) => {
      console.error('AI Worker error:', e);
      setIsAiThinking(false);
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── WASM (Connect-4 only for now) ────────────────────────────────────────────
  useEffect(() => {
    loadWasm().then(ok => setWasmReady(ok));
  }, []);

  // ── Trigger AI turn ─────────────────────────────────────────────────────────
  useEffect(() => {
    const { status, currentPlayer, board } = gameState;
    if (gameModeRef.current !== 'pvai') return;
    if (status !== 'playing') return;

    const aiPiece = gameTypeRef.current === 'ttt' ? TTT_P2 : AI;
    if (currentPlayer !== aiPiece) return;

    setIsAiThinking(true);

    if (gameTypeRef.current === 'connect4') {
      const depth = DIFFICULTY_DEPTH[difficultyRef.current];
      if (isWasmLoaded()) {
        const col = wasmGetBestMove(board, depth, AI, PLAYER);
        if (col !== null) {
          const newState = c4Apply(gameState, col);
          setGameState(newState);
          setIsAiThinking(false);
          playDrop();
          if      (newState.status === 'ai-won') playLose();
          else if (newState.status === 'draw')   playDraw();
          return;
        }
      }
      workerRef.current?.postMessage({
        gameType: 'connect4', board, depth, aiPiece: AI, humanPiece: PLAYER,
      });
    } else {
      const depth = TTT_DIFFICULTY_DEPTH[difficultyRef.current];
      workerRef.current?.postMessage({
        gameType: 'ttt', board, depth, aiPiece: TTT_P2, humanPiece: TTT_P1,
      });
    }
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stats tracking ────────────────────────────────────────────────────────────
  const prevStatusRef = useRef(gameState.status);

  useEffect(() => {
    const prev = prevStatusRef.current;
    const curr = gameState.status;
    prevStatusRef.current = curr;

    if (curr === 'playing' || prev !== 'playing') return;
    if (gameModeRef.current !== 'pvai') return;

    const gt = gameTypeRef.current;
    setStats(s => {
      let updated: Stats;
      if      (curr === 'player-won') updated = { ...s, wins:   s.wins   + 1 };
      else if (curr === 'ai-won')     updated = { ...s, losses: s.losses + 1 };
      else                            updated = { ...s, draws:  s.draws  + 1 };
      saveStats(gt, updated);
      return updated;
    });
  }, [gameState.status]);

  // ── Public actions ────────────────────────────────────────────────────────────

  /**
   * makeMove(row, col) for TTT; makeMove(col) for Connect-4.
   */
  const makeMove = useCallback((rowOrCol: number, colArg?: number) => {
    resumeAudio();
    const { status, currentPlayer, board } = gameStateRef.current;
    if (status !== 'playing' || isAiThinking) return;

    if (gameTypeRef.current === 'ttt') {
      const row = rowOrCol;
      const col = colArg ?? rowOrCol;  // fallback shouldn't happen in practice
      if (!tttIsValidMove(board, row, col)) return;
      if (gameModeRef.current === 'pvai' && currentPlayer !== TTT_P1) return;

      const pvp      = gameModeRef.current === 'pvp';
      const newState = tttApplyMove(gameStateRef.current, row, col, pvp);
      setGameState(newState);
      playDrop();

      const { status: s } = newState;
      if      (s === 'player-won' || s === 'p1-won') playWin();
      else if (s === 'p2-won')                       playLose();
      else if (s === 'draw')                         playDraw();

    } else {
      const col = rowOrCol;
      if (!c4IsValidMove(board, col)) return;
      if (gameModeRef.current === 'pvai' && currentPlayer !== PLAYER) return;

      const applyFn  = gameModeRef.current === 'pvp' ? c4ApplyPvP : c4Apply;
      const newState = applyFn(gameStateRef.current, col);
      setGameState(newState);
      playDrop();

      const { status: s } = newState;
      if      (s === 'player-won' || s === 'p1-won') playWin();
      else if (s === 'p2-won')                       playLose();
      else if (s === 'draw')                         playDraw();
    }
  }, [isAiThinking]);

  const resetGame = useCallback(() => {
    const initial = gameTypeRef.current === 'ttt' ? TTT_INITIAL_STATE : C4_INITIAL;
    setGameState({ ...initial });
    setIsAiThinking(false);
  }, []);

  const resetStats = useCallback(() => {
    const fresh: Stats = { wins: 0, losses: 0, draws: 0 };
    setStats(fresh);
    saveStats(gameTypeRef.current, fresh);
  }, []);

  const handleSetDifficulty = useCallback((d: Difficulty) => {
    setDifficulty(d);
  }, []);

  const handleSetGameMode = useCallback((m: GameMode) => {
    setGameMode(m);
    const initial = gameTypeRef.current === 'ttt' ? TTT_INITIAL_STATE : C4_INITIAL;
    setGameState({ ...initial });
    setIsAiThinking(false);
  }, []);

  const handleSetGameType = useCallback((t: GameType) => {
    setGameTypeState(t);
    gameTypeRef.current = t;
    const initial = t === 'ttt' ? TTT_INITIAL_STATE : C4_INITIAL;
    setGameState({ ...initial });
    setIsAiThinking(false);
    setStats(loadStats(t));
  }, []);

  return {
    gameType,
    setGameType: handleSetGameType,
    gameState,
    difficulty,
    setDifficulty: handleSetDifficulty,
    gameMode,
    setGameMode: handleSetGameMode,
    stats,
    resetStats,
    isAiThinking,
    wasmReady,
    makeMove,
    resetGame,
  };
}
