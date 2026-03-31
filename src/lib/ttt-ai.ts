/**
 * ttt-ai.ts
 * Minimax + alpha-beta pruning for Tic-Tac-Toe.
 * The game tree is tiny (≤9 moves), so even depth=9 is instant.
 * Difficulty is mapped to search depth to stay consistent with Connect-4 UX.
 */
import type { Board, CellValue, Difficulty } from '../types/game';
import {
  TTT_P1, TTT_P2,
  tttCheckWin, tttIsBoardFull, tttGetValidMoves,
  tttPlaceInPlace, tttUnplace,
} from './ttt-engine';

export const TTT_DIFFICULTY_DEPTH: Record<Difficulty, number> = {
  easy:   1,   // only 1 move ahead — makes deliberate mistakes
  medium: 3,   // plays reasonably but not perfectly
  hard:   9,   // full search — unbeatable
};

// ─── Heuristic (only used when depth=0 cutoff is hit, not at terminal nodes) ──

function evaluateBoard(board: Board, aiPiece: CellValue, humanPiece: CellValue): number {
  // Count two-in-a-row potential for each player
  const lines = [
    [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
    [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
  ];
  let score = 0;
  for (const line of lines) {
    let ai = 0, hu = 0;
    for (const [r, c] of line) {
      if (board[r][c] === aiPiece)    ai++;
      else if (board[r][c] === humanPiece) hu++;
    }
    if (ai > 0 && hu === 0) score += ai * ai;   // 1 = 1, 2 = 4
    if (hu > 0 && ai === 0) score -= hu * hu;
  }
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
  if (tttCheckWin(board, aiPiece))    return 100 + depth;   // win sooner = higher
  if (tttCheckWin(board, humanPiece)) return -100 - depth;
  if (tttIsBoardFull(board) || depth === 0)
    return evaluateBoard(board, aiPiece, humanPiece);

  const moves = tttGetValidMoves(board);

  if (maximizing) {
    let best = -Infinity;
    for (const [r, c] of moves) {
      tttPlaceInPlace(board, r, c, aiPiece);
      const s = minimax(board, depth - 1, alpha, beta, false, aiPiece, humanPiece);
      tttUnplace(board, r, c);
      if (s > best)  best  = s;
      if (s > alpha) alpha = s;
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const [r, c] of moves) {
      tttPlaceInPlace(board, r, c, humanPiece);
      const s = minimax(board, depth - 1, alpha, beta, true, aiPiece, humanPiece);
      tttUnplace(board, r, c);
      if (s < best) best = s;
      if (s < beta) beta = s;
      if (alpha >= beta) break;
    }
    return best;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface TttMove { row: number; col: number; }

/**
 * Returns the best [row, col] for aiPiece.
 * Works on a mutable clone so the caller's board is not modified.
 */
export function tttGetBestMove(
  board: Board,
  depth: number,
  aiPiece: CellValue  = TTT_P2,
  humanPiece: CellValue = TTT_P1
): TttMove {
  const work = board.map(row => [...row] as CellValue[]);
  const moves = tttGetValidMoves(work);

  let bestScore = -Infinity;
  let bestMove  = moves[0];

  for (const [r, c] of moves) {
    tttPlaceInPlace(work, r, c, aiPiece);
    const score = minimax(work, depth - 1, -Infinity, Infinity, false, aiPiece, humanPiece);
    tttUnplace(work, r, c);
    if (score > bestScore) {
      bestScore = score;
      bestMove  = [r, c];
    }
  }

  return { row: bestMove[0], col: bestMove[1] };
}
