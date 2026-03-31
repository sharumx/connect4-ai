import { memo } from 'react';
import type { Stats } from '../types/game';

interface StatsProps {
  stats: Stats;
  onReset: () => void;
}

function StatsPanel({ stats, onReset }: StatsProps) {
  const total = stats.wins + stats.losses + stats.draws;
  const winPct = total > 0 ? Math.round((stats.wins / total) * 100) : 0;

  return (
    <div className="panel">
      <h3 className="panel-title">Stats</h3>
      <div className="stats-grid">
        <div className="stat-box win">
          <span className="stat-num">{stats.wins}</span>
          <span className="stat-lbl">Wins</span>
        </div>
        <div className="stat-box loss">
          <span className="stat-num">{stats.losses}</span>
          <span className="stat-lbl">Losses</span>
        </div>
        <div className="stat-box draw">
          <span className="stat-num">{stats.draws}</span>
          <span className="stat-lbl">Draws</span>
        </div>
      </div>
      {total > 0 && (
        <p className="win-rate">Win rate: <strong>{winPct}%</strong></p>
      )}
      <button className="ghost-btn" onClick={onReset} title="Clear all stats">
        Reset stats
      </button>
    </div>
  );
}

export default memo(StatsPanel);
