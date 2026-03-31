/**
 * ai-worker.ts
 * Web Worker: runs Minimax AI for both Connect-4 and Tic-Tac-Toe on a
 * background thread so the main UI thread is never blocked.
 *
 * Vite import syntax: import AIWorker from './ai-worker?worker'
 */
import { getBestMove }    from '../lib/connect4-ai';
import { tttGetBestMove } from '../lib/ttt-ai';
import type { Board, CellValue, GameType } from '../types/game';

interface WorkerRequest {
  gameType: GameType;
  board: Board;
  depth: number;
  aiPiece: CellValue;
  humanPiece: CellValue;
}

// Connect-4 response uses `col`, TTT uses `row` + `col`
interface WorkerResponse {
  col: number;
  row?: number;
}

self.onmessage = ({ data }: MessageEvent<WorkerRequest>) => {
  const { gameType, board, depth, aiPiece, humanPiece } = data;
  const post = (self as unknown as { postMessage(d: WorkerResponse): void }).postMessage.bind(self);

  if (gameType === 'ttt') {
    const { row, col } = tttGetBestMove(board, depth, aiPiece, humanPiece);
    post({ row, col });
  } else {
    const col = getBestMove(board, depth, aiPiece, humanPiece);
    post({ col });
  }
};
