import React from 'react';
import Cell from './Cell.jsx';

const CELL_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function Board({ state, thinking, onCellClick }) {
  if (!state) {
    return <div className="board board--loading" aria-busy="true" />;
  }

  const winSet = new Set(state.win_line || []);
  const isHumanTurn = state.to_move === state.human_mark && state.status === 'playing';
  const interactive = isHumanTurn && !thinking;

  return (
    <div
      className={`board ${state.status !== 'playing' ? 'board--settled' : ''} ${
        thinking ? 'board--thinking' : ''
      }`}
      role="grid"
      aria-label="OXO board"
    >
      {CELL_INDICES.map((i) => (
        <Cell
          key={i}
          index={i}
          mark={state.board[i]}
          winning={winSet.has(i)}
          interactive={interactive && state.board[i] === ' '}
          onClick={() => onCellClick(i)}
        />
      ))}
    </div>
  );
}
