import { memo } from 'react';
import type { GameMode, GameState, GameType } from '../types/game';

interface GameInfoProps {
  gameState: GameState;
  isAiThinking: boolean;
  gameMode: GameMode;
  wasmReady: boolean;
  gameType: GameType;
}

const STATUS_MESSAGES: Record<string, (mode: GameMode) => string> = {
  playing:    (mode) => mode === 'pvai' ? '' : '',
  'player-won': ()  => '🎉 You win!',
  'ai-won':    ()   => '🤖 AI wins!',
  'p1-won':    ()   => '✕ Player 1 wins!',
  'p2-won':    ()   => '○ Player 2 wins!',
  draw:        ()   => '🤝 It\'s a draw!',
};

function GameInfo({ gameState, isAiThinking, gameMode, wasmReady, gameType }: GameInfoProps) {
  const { status, currentPlayer } = gameState;

  const terminalMsg = STATUS_MESSAGES[status]?.(gameMode) ?? '';
  const isTerminal  = status !== 'playing';

  const isTtt = gameType === 'ttt';
  const p1Icon = isTtt ? '✕' : '🔴';
  const p2Icon = isTtt ? '○' : '🟡';

  const turnLabel =
    gameMode === 'pvai'
      ? (currentPlayer === 1 ? `${p1Icon} Your turn` : `${p2Icon} AI thinking…`)
      : (currentPlayer === 1 ? `${p1Icon} Player 1's turn` : `${p2Icon} Player 2's turn`);

  return (
    <div className="game-info">
      {isTerminal ? (
        <p className="status-msg terminal">{terminalMsg}</p>
      ) : (
        <p className={`status-msg ${isAiThinking ? 'thinking-pulse' : ''}`}>
          {isAiThinking ? `${p2Icon} AI thinking…` : turnLabel}
        </p>
      )}

      {wasmReady && (
        <span className="wasm-badge" title="AI powered by WebAssembly">⚡ WASM</span>
      )}
    </div>
  );
}

export default memo(GameInfo);
