import { memo } from 'react';
import type { GameMode } from '../types/game';

interface GameModeProps {
  gameMode: GameMode;
  onChange: (m: GameMode) => void;
}

function GameModeSelector({ gameMode, onChange }: GameModeProps) {
  return (
    <div className="panel">
      <h3 className="panel-title">Mode</h3>
      <div className="btn-group vertical">
        <button
          className={`pill-btn ${gameMode === 'pvai' ? 'active' : ''}`}
          onClick={() => onChange('pvai')}
        >
          vs AI
        </button>
        <button
          className={`pill-btn ${gameMode === 'pvp' ? 'active' : ''}`}
          onClick={() => onChange('pvp')}
        >
          vs Player
        </button>
      </div>

      <div className="legend">
        <div className="legend-item">
          <span className="legend-dot p1" />
          <span>{gameMode === 'pvp' ? 'Player 1' : 'You (Red)'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot p2" />
          <span>{gameMode === 'pvp' ? 'Player 2' : 'AI (Yellow)'}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(GameModeSelector);
