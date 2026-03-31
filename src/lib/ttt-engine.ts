/**
 * ttt-engine.ts
 * Pure Tic-Tac-Toe game logic — 3×3 board, same CellValue conventions as
 * Connect-4 (0=empty, 1=player, 2=AI / player-2).
 * No DOM — safe in Web Worker.
 */
import type { Board, CellValue, GameState, GameStatus, WinCell } from '../types/game';

export const TTT_SIZE  = 3;
export const TTT_EMPTY = 0 as CellValue;
export const TTT_P1    = 1 as CellValue;
export const TTT_P2    = 2 as CellValue;

// All eight winning lines (row, col, or diagonal) as [r,c] pairs
export const WIN_LINES: [number, number][][] = [
  // rows
  [[0,0],[0,1],[0,2]],
  [[1,0],[1,1],[1,2]],
  [[2,0],[2,1],[2,2]],
  // cols
  [[0,0],[1,0],[2,0]],
  [[0,1],[1,1],[2,1]],
  [[0,2],[1,2],[2,2]],
  // diagonals
  [[0,0],[1,1],[2,2]],
  [[0,2],[1,1],[2,0]],
];

export function createEmptyTttBoard(): Board {
  return Array.from({ length: TTT_SIZE }, () =>
    Array<CellValue>(TTT_SIZE).fill(TTT_EMPTY)
  );
}

export function cloneTttBoard(board: Board): Board {
  return board.map(row => [...row] as CellValue[]);
}

export function tttIsValidMove(board: Board, row: number, col: number): boolean {
  return board[row][col] === TTT_EMPTY;
}

/** Immutable place — returns new board. */
export function tttPlacePiece(board: Board, row: number, col: number, piece: CellValue): Board {
  const nb = cloneTttBoard(board);
  nb[row][col] = piece;
  return nb;
}

/** Mutable place (for AI search). */
export function tttPlaceInPlace(board: Board, row: number, col: number, piece: CellValue): void {
  board[row][col] = piece;
}

export function tttUnplace(board: Board, row: number, col: number): void {
  board[row][col] = TTT_EMPTY;
}

export function tttCheckWin(board: Board, piece: CellValue): boolean {
  return WIN_LINES.some(line =>
    line.every(([r, c]) => board[r][c] === piece)
  );
}

export function tttIsBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== TTT_EMPTY));
}

export function tttGetValidMoves(board: Board): [number, number][] {
  const moves: [number, number][] = [];
  // Centre first, then corners, then edges — best for pruning
  const order: [number, number][] = [
    [1,1],[0,0],[0,2],[2,0],[2,2],[0,1],[1,0],[1,2],[2,1],
  ];
  for (const [r, c] of order) {
    if (board[r][c] === TTT_EMPTY) moves.push([r, c]);
  }
  return moves;
}

export function tttGetWinningCells(board: Board, piece: CellValue): WinCell[] {
  for (const line of WIN_LINES) {
    if (line.every(([r, c]) => board[r][c] === piece)) {
      return line.map(([r, c]) => ({ row: r, col: c }));
    }
  }
  return [];
}

// ─── Immutable state transition ───────────────────────────────────────────────

export const TTT_INITIAL_STATE: GameState = {
  board: createEmptyTttBoard(),
  currentPlayer: TTT_P1 as 1 | 2,
  status: 'playing',
  winningCells: [],
  lastMove: null,
  moveCount: 0,
};

/**
 * Apply a move at (row, col) and return the new GameState.
 * `pvpLabels` → use p1-won / p2-won instead of player-won / ai-won.
 */
export function tttApplyMove(
  state: GameState,
  row: number,
  col: number,
  pvpLabels = false
): GameState {
  if (!tttIsValidMove(state.board, row, col)) return state;

  const newBoard = tttPlacePiece(state.board, row, col, state.currentPlayer);
  const won  = tttCheckWin(newBoard, state.currentPlayer);
  const full = tttIsBoardFull(newBoard);

  let status: GameStatus = 'playing';
  let winningCells: WinCell[] = [];

  if (won) {
    winningCells = tttGetWinningCells(newBoard, state.currentPlayer);
    if (pvpLabels) {
      status = state.currentPlayer === 1 ? 'p1-won' : 'p2-won';
    } else {
      status = state.currentPlayer === 1 ? 'player-won' : 'ai-won';
    }
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
