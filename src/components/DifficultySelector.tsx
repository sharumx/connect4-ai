import { memo } from 'react';
import type { Difficulty } from '../types/game';

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (d: Difficulty) => void;
  disabled: boolean;
}

const LEVELS: { value: Difficulty; label: string; depth: string }[] = [
  { value: 'easy',   label: 'Easy',   depth: 'depth 2' },
  { value: 'medium', label: 'Medium', depth: 'depth 4' },
  { value: 'hard',   label: 'Hard',   depth: 'depth 7' },
];

function DifficultySelector({ difficulty, onChange, disabled }: DifficultySelectorProps) {
  return (
    <div className="panel">
      <h3 className="panel-title">Difficulty</h3>
      {disabled && <p className="panel-note">Reset game to change</p>}
      <div className="btn-group vertical">
        {LEVELS.map(({ value, label, depth }) => (
          <button
            key={value}
            className={`pill-btn ${difficulty === value ? 'active' : ''}`}
            onClick={() => !disabled && onChange(value)}
            disabled={disabled}
            title={depth}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(DifficultySelector);
