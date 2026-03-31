import type { GameState } from '../types/game';
import { TTT_P1, TTT_P2 } from '../lib/ttt-engine';

interface Props {
  gameState:    GameState;
  onCellClick:  (row: number, col: number) => void;
  isAiThinking: boolean;
}

export default function TttBoard({ gameState, onCellClick, isAiThinking }: Props) {
  const { board, status, winningCells } = gameState;

  const isWinCell = (r: number, c: number) =>
    winningCells.some(w => w.row === r && w.col === c);

  const isOver      = status !== 'playing';
  const notClickable = isOver || isAiThinking;

  return (
    <div className={`ttt-grid${notClickable ? ' ttt-no-hover' : ''}`}>
      {(board as number[][]).map((row, r) =>
        row.map((cell, c) => {
          const winning = isWinCell(r, c);
          const cls = [
            'ttt-cell',
            cell === TTT_P1 ? 'p1' : cell === TTT_P2 ? 'p2' : '',
            winning ? 'winning' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={`${r}-${c}`}
              className={cls}
              onClick={() => !notClickable && cell === 0 && onCellClick(r, c)}
              role="button"
              aria-label={
                cell === 0
                  ? `Empty cell row ${r + 1} col ${c + 1}`
                  : `${cell === TTT_P1 ? 'X' : 'O'} at row ${r + 1} col ${c + 1}`
              }
            />
          );
        })
      )}
    </div>
  );
}
