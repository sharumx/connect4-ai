/**
 * connect4-engine.ts
 * Pure game-logic layer — no DOM, safe to use in Web Workers.
 * Mirrors the C++ connect4.hpp / connect4.cpp exactly.
 */
import type { Board, CellValue, GameState, GameStatus, WinCell } from '../types/game';

export const ROWS = 6;
export const COLS = 7;
export const EMPTY  = 0 as CellValue;
export const PLAYER = 1 as CellValue;   // Human (Red)
export const AI     = 2 as CellValue;   // Computer (Yellow)

/** Move ordering: center columns first for better alpha-beta pruning */
export const MOVE_ORDER = [3, 2, 4, 1, 5, 0, 6] as const;

// ─── Board helpers ────────────────────────────────────────────────────────────

export function createEmptyBoard(): Board {
  return Array.from({ length: ROWS }, () =>
    Array<CellValue>(COLS).fill(EMPTY)
  );
}

export function cloneBoard(board: Board): Board {
  return board.map(row => [...row] as CellValue[]);
}

export function isValidMove(board: Board, col: number): boolean {
  return col >= 0 && col < COLS && board[0][col] === EMPTY;
}

/**
 * Mutates `board` in-place (used by AI search).
 * Returns the row the piece landed on, or -1 if column is full.
 */
export function dropPieceInPlace(board: Board, col: number, piece: CellValue): number {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      board[row][col] = piece;
      return row;
    }
  }
  return -1;
}

/** Undo the most-recently-dropped piece in a column (AI search undo step). */
export function undropPiece(board: Board, col: number): void {
  for (let row = 0; row < ROWS; row++) {
    if (board[row][col] !== EMPTY) {
      board[row][col] = EMPTY;
      return;
    }
  }
}

/**
 * Immutable drop — returns a new board plus the landing row.
 * Used by React state updates.
 */
export function dropPiece(
  board: Board,
  col: number,
  piece: CellValue
): { board: Board; row: number } {
  const newBoard = cloneBoard(board);
  const row = dropPieceInPlace(newBoard, col, piece);
  return { board: newBoard, row };
}

// ─── Win / draw detection ─────────────────────────────────────────────────────

export function checkWin(board: Board, piece: CellValue): boolean {
  // Horizontal
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r][c+1] === piece &&
          board[r][c+2] === piece && board[r][c+3] === piece)
        return true;

  // Vertical
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - 4; r++)
      if (board[r][c] === piece && board[r+1][c] === piece &&
          board[r+2][c] === piece && board[r+3][c] === piece)
        return true;

  // Positive diagonal (↗)
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r+1][c+1] === piece &&
          board[r+2][c+2] === piece && board[r+3][c+3] === piece)
        return true;

  // Negative diagonal (↘)
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r-1][c+1] === piece &&
          board[r-2][c+2] === piece && board[r-3][c+3] === piece)
        return true;

  return false;
}

export function isBoardFull(board: Board): boolean {
  return board[0].every(c => c !== EMPTY);
}

export function getValidMoves(board: Board): number[] {
  return MOVE_ORDER.filter(col => isValidMove(board, col));
}

export function getWinningCells(board: Board, piece: CellValue): WinCell[] {
  // Horizontal
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r][c+1] === piece &&
          board[r][c+2] === piece && board[r][c+3] === piece)
        return [{row:r,col:c},{row:r,col:c+1},{row:r,col:c+2},{row:r,col:c+3}];

  // Vertical
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - 4; r++)
      if (board[r][c] === piece && board[r+1][c] === piece &&
          board[r+2][c] === piece && board[r+3][c] === piece)
        return [{row:r,col:c},{row:r+1,col:c},{row:r+2,col:c},{row:r+3,col:c}];

  // Positive diagonal
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r+1][c+1] === piece &&
          board[r+2][c+2] === piece && board[r+3][c+3] === piece)
        return [{row:r,col:c},{row:r+1,col:c+1},{row:r+2,col:c+2},{row:r+3,col:c+3}];

  // Negative diagonal
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      if (board[r][c] === piece && board[r-1][c+1] === piece &&
          board[r-2][c+2] === piece && board[r-3][c+3] === piece)
        return [{row:r,col:c},{row:r-1,col:c+1},{row:r-2,col:c+2},{row:r-3,col:c+3}];

  return [];
}

// ─── Immutable state transition ───────────────────────────────────────────────

export const INITIAL_STATE: GameState = {
  board: createEmptyBoard(),
  currentPlayer: PLAYER as 1 | 2,
  status: 'playing',
  winningCells: [],
  lastMove: null,
  moveCount: 0,
};

/**
 * Apply a move to a game state and return the new state (immutable).
 * Does NOT validate turns — caller is responsible.
 */
export function applyMove(state: GameState, col: number): GameState {
  if (!isValidMove(state.board, col)) return state;

  const { board: newBoard, row } = dropPiece(state.board, col, state.currentPlayer);
  const won = checkWin(newBoard, state.currentPlayer);
  const full = isBoardFull(newBoard);

  let status: GameStatus = 'playing';
  let winningCells: WinCell[] = [];

  if (won) {
    winningCells = getWinningCells(newBoard, state.currentPlayer);
    if (state.currentPlayer === PLAYER) status = 'player-won';
    else                                status = 'ai-won';
  } else if (full) {
    status = 'draw';
  }

  return {
    board: newBoard,
    currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    status,
    winningCells,
    lastMove: { row, col },
    moveCount: state.moveCount + 1,
  };
}

/** Same as applyMove but status reflects PvP labelling (p1-won / p2-won). */
export function applyMovePvP(state: GameState, col: number): GameState {
  const next = applyMove(state, col);
  if (next.status === 'player-won') return { ...next, status: 'p1-won' };
  if (next.status === 'ai-won')     return { ...next, status: 'p2-won' };
  return next;
}
