import React from 'react';

const DIFFICULTIES = [
  { id: 'casual', label: 'Casual' },
  { id: 'standard', label: 'Standard' },
  { id: 'unbeatable', label: 'Unbeatable' },
];

export default function Controls({ state, ready, onNewGame, onResetScore }) {
  const difficulty = state?.difficulty ?? 'standard';
  const humanMark = state?.human_mark ?? 'X';

  return (
    <div className="controls">
      <div className="controls__row controls__row--settings">
        <div className="controls__group" role="radiogroup" aria-label="Difficulty">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={difficulty === d.id}
              className={`chip ${difficulty === d.id ? 'chip--active' : ''}`}
              onClick={() => onNewGame({ difficulty: d.id, humanMark })}
              disabled={!ready}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="controls__group" role="radiogroup" aria-label="Your mark">
          {['X', 'O'].map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={humanMark === m}
              className={`chip chip--mark ${humanMark === m ? 'chip--active' : ''} ${
                m === 'X' ? 'chip--mark-x' : 'chip--mark-o'
              }`}
              onClick={() => onNewGame({ difficulty, humanMark: m })}
              disabled={!ready}
            >
              Play {m}
            </button>
          ))}
        </div>
      </div>

      <div className="controls__row controls__row--actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => onNewGame({ difficulty, humanMark })}
          disabled={!ready}
        >
          New game
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onResetScore}
          disabled={!ready}
        >
          Reset score
        </button>
      </div>
    </div>
  );
}
