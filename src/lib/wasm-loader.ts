/**
 * wasm-loader.ts
 * Attempts to load the Emscripten-compiled WebAssembly module.
 * Falls back gracefully to the TypeScript implementation if WASM is unavailable.
 */
import type { Board, CellValue, WinCell } from '../types/game';

export interface Connect4WasmModule {
  getBestMove(board: number[], depth: number, aiPiece: number, humanPiece: number): number;
  checkWin(board: number[], piece: number): boolean;
  isBoardFull(board: number[]): boolean;
  getWinningCells(board: number[], piece: number): WinCell[];
}

let _module: Connect4WasmModule | null = null;
let _loaded = false;
let _loadAttempted = false;

/** Load the Emscripten WASM module from /wasm/connect4.js. */
export async function loadWasm(): Promise<boolean> {
  if (_loadAttempted) return _loaded;
  _loadAttempted = true;

  try {
    // Inject the Emscripten-generated loader script
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/wasm/connect4.js';
      s.onload  = () => resolve();
      s.onerror = () => reject(new Error('WASM script not found'));
      document.head.appendChild(s);
    });

    const factory = (window as unknown as Record<string, unknown>)['createConnect4Module'];
    if (typeof factory !== 'function') throw new Error('WASM factory not found');

    _module = await (factory as () => Promise<Connect4WasmModule>)();
    _loaded = true;
    console.info('✅ Connect-4 WASM module loaded');
    return true;
  } catch (err) {
    console.warn('⚠️  WASM not available — using TypeScript AI fallback.', err);
    _loaded = false;
    return false;
  }
}

export function isWasmLoaded(): boolean { return _loaded; }

/** Returns the module, or null if WASM was not successfully loaded. */
export function getWasmModule(): Connect4WasmModule | null { return _module; }

// ─── Convenience wrappers that auto-flatten 2-D board ─────────────────────────

export function wasmGetBestMove(
  board: Board, depth: number,
  aiPiece: CellValue, humanPiece: CellValue
): number | null {
  if (!_module) return null;
  const flat = board.flat() as number[];
  return _module.getBestMove(flat, depth, aiPiece, humanPiece);
}

export function wasmCheckWin(board: Board, piece: CellValue): boolean | null {
  if (!_module) return null;
  return _module.checkWin(board.flat() as number[], piece);
}

export function wasmGetWinningCells(board: Board, piece: CellValue): WinCell[] | null {
  if (!_module) return null;
  return _module.getWinningCells(board.flat() as number[], piece);
}
