import { memo } from 'react';
import type { CellValue } from '../types/game';

interface CellProps {
  value: CellValue;
  isWinning: boolean;
  isLastMove: boolean;
  row: number;
}

function Cell({ value, isWinning, isLastMove, row }: CellProps) {
  const pieceClass =
    value === 1 ? 'piece p1' :
    value === 2 ? 'piece p2' : '';

  // Approximate pixel drop distance based on destination row.
  // Each cell is ~68px (60px + 8px gap). The preview row adds ~70px offset.
  const dropPx = (row + 1) * 68 + 16;

  return (
    <div className={`cell ${isWinning ? 'winning' : ''}`}>
      {value !== 0 && (
        <div
          className={`${pieceClass} ${isLastMove ? 'just-placed' : ''} ${isWinning ? 'win-flash' : ''}`}
          style={isLastMove ? ({ '--drop-px': `${dropPx}px` } as React.CSSProperties) : undefined}
        />
      )}
    </div>
  );
}

export default memo(Cell);
