import { useState, useCallback, memo } from 'react';
import type { GameState } from '../types/game';
import { isValidMove, COLS, ROWS } from '../lib/connect4-engine';
import Cell from './Cell';

interface BoardProps {
  gameState: GameState;
  onColumnClick: (col: number) => void;
  isAiThinking: boolean;
}

function Board({ gameState, onColumnClick, isAiThinking }: BoardProps) {
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  const canInteract =
    gameState.status === 'playing' &&
    !isAiThinking;

  const handleMouseEnter = useCallback((col: number) => {
    if (canInteract) setHoverCol(col);
  }, [canInteract]);

  const handleMouseLeave = useCallback(() => setHoverCol(null), []);

  const handleClick = useCallback((col: number) => {
    if (canInteract && isValidMove(gameState.board, col)) onColumnClick(col);
  }, [canInteract, gameState.board, onColumnClick]);

  const isWinCell = (r: number, c: number) =>
    gameState.winningCells.some(w => w.row === r && w.col === c);

  const isLastMove = (r: number, c: number) =>
    gameState.lastMove?.row === r && gameState.lastMove?.col === c;

  return (
    <div className={`board-wrap ${isAiThinking ? 'thinking' : ''}`}>
      {/* Drop-preview row above the board */}
      <div className="preview-row">
        {Array.from({ length: COLS }, (_, c) => (
          <div key={c} className="preview-cell">
            {hoverCol === c && canInteract && isValidMove(gameState.board, c) && (
              <div className={`preview-piece p${gameState.currentPlayer}`} />
            )}
          </div>
        ))}
      </div>

      {/* Column click targets */}
      <div
        className="board-grid"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: COLS }, (_, c) => (
          <div
            key={c}
            className={`board-col ${hoverCol === c && canInteract ? 'hovered' : ''}`}
            onMouseEnter={() => handleMouseEnter(c)}
            onClick={() => handleClick(c)}
            role="button"
            aria-label={`Drop in column ${c + 1}`}
          >
            {Array.from({ length: ROWS }, (_, r) => (
              <Cell
                key={r}
                value={gameState.board[r][c]}
                isWinning={isWinCell(r, c)}
                isLastMove={isLastMove(r, c)}
                row={r}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(Board);
