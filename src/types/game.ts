// ─── Core board types ──────────────────────────────────────────────────────────
/** 0 = empty, 1 = human player (Red), 2 = AI player (Yellow) */
export type CellValue = 0 | 1 | 2;

export type Board = CellValue[][];

// ─── Game config ───────────────────────────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode   = 'pvai' | 'pvp';
export type GameType   = 'connect4' | 'ttt';

// ─── Game state ────────────────────────────────────────────────────────────────
export type GameStatus = 'playing' | 'player-won' | 'ai-won' | 'p1-won' | 'p2-won' | 'draw';

export interface WinCell {
  row: number;
  col: number;
}

export interface LastMove {
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  /** 1 = Player / Player-1, 2 = AI / Player-2 */
  currentPlayer: 1 | 2;
  status: GameStatus;
  winningCells: WinCell[];
  lastMove: LastMove | null;
  moveCount: number;
}

// ─── Stats ─────────────────────────────────────────────────────────────────────
export interface Stats {
  wins: number;
  losses: number;
  draws: number;
}
