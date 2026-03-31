/**
 * connect4-ai.ts
 * TypeScript Minimax + alpha-beta pruning AI for Connect 4.
 * Pure logic — no DOM, safe to use in a Web Worker.
 * Mirrors the C++ ai.cpp exactly so WASM and TS behave identically.
 */
import type { Board, CellValue, Difficulty } from '../types/game';
import {
  ROWS, COLS, PLAYER, AI, EMPTY,
  checkWin, isBoardFull, getValidMoves,
  dropPieceInPlace, undropPiece,
} from './connect4-engine';

// ─── Difficulty → search depth ────────────────────────────────────────────────
export const DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy:   2,
  medium: 4,
  hard:   7,
};

// ─── Evaluation helpers ───────────────────────────────────────────────────────

/** Score a window of 4 cells for `piece` against `opp`. */
function scoreWindow(
  a: number, b: number, c: number, d: number,
  piece: number, opp: number
): number {
  let p = 0, e = 0, o = 0;
  for (const v of [a, b, c, d]) {
    if      (v === piece) p++;
    else if (v === EMPTY) e++;
    else if (v === opp)   o++;
  }
  if (p === 4)           return 100;
  if (p === 3 && e === 1) return 5;
  if (p === 2 && e === 2) return 2;
  if (o === 3 && e === 1) return -4;
  return 0;
}

/**
 * Heuristic board score for `piece`.
 * Rewards center control, and values all horizontal/vertical/diagonal windows.
 */
function evaluateBoard(board: Board, piece: number, opp: number): number {
  let score = 0;

  // Center column preference
  const center = Math.floor(COLS / 2);
  for (let r = 0; r < ROWS; r++)
    if (board[r][center] === piece) score += 3;

  // Horizontal
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += scoreWindow(board[r][c], board[r][c+1], board[r][c+2], board[r][c+3], piece, opp);

  // Vertical
  for (let c = 0; c < COLS; c++)
    for (let r = 0; r <= ROWS - 4; r++)
      score += scoreWindow(board[r][c], board[r+1][c], board[r+2][c], board[r+3][c], piece, opp);

  // Positive diagonal (↗)
  for (let r = 0; r <= ROWS - 4; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += scoreWindow(board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3], piece, opp);

  // Negative diagonal (↘)
  for (let r = 3; r < ROWS; r++)
    for (let c = 0; c <= COLS - 4; c++)
      score += scoreWindow(board[r][c], board[r-1][c+1], board[r-2][c+2], board[r-3][c+3], piece, opp);

  return score;
}

// ─── Minimax + alpha-beta ─────────────────────────────────────────────────────

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPiece: CellValue,
  humanPiece: CellValue
): number {
  if (checkWin(board, aiPiece))    return 100_000 + depth;  // sooner win = higher score
  if (checkWin(board, humanPiece)) return -100_000 - depth;
  if (isBoardFull(board) || depth === 0)
    return evaluateBoard(board, aiPiece, humanPiece);

  const moves = getValidMoves(board);

  if (maximizing) {
    let best = -Infinity;
    for (const col of moves) {
      dropPieceInPlace(board, col, aiPiece);
      const s = minimax(board, depth - 1, alpha, beta, false, aiPiece, humanPiece);
      undropPiece(board, col);
      if (s > best) best  = s;
      if (s > alpha) alpha = s;
      if (alpha >= beta) break;   // β-cutoff
    }
    return best;
  } else {
    let best = Infinity;
    for (const col of moves) {
      dropPieceInPlace(board, col, humanPiece);
      const s = minimax(board, depth - 1, alpha, beta, true, aiPiece, humanPiece);
      undropPiece(board, col);
      if (s < best) best = s;
      if (s < beta) beta = s;
      if (alpha >= beta) break;   // α-cutoff
    }
    return best;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return the best column for `aiPiece` to play.
 * Mutates a working copy of the board internally; the original is not modified.
 */
export function getBestMove(
  board: Board,
  depth: number,
  aiPiece: CellValue   = AI,
  humanPiece: CellValue = PLAYER
): number {
  // Work on a mutable clone so the caller's board is unchanged
  const workBoard = board.map(row => [...row] as CellValue[]);

  const moves = getValidMoves(workBoard);
  let bestScore = -Infinity;
  let bestCol   = moves[0];

  for (const col of moves) {
    dropPieceInPlace(workBoard, col, aiPiece);
    const score = minimax(workBoard, depth - 1, -Infinity, Infinity, false, aiPiece, humanPiece);
    undropPiece(workBoard, col);
    if (score > bestScore) {
      bestScore = score;
      bestCol   = col;
    }
  }
  return bestCol;
}
