import React from 'react';

export default function StatusBar({ state, thinking, score }) {
  const message = describe(state, thinking);

  return (
    <div className="status">
      <div className="status__message">
        <span className={`status__pulse ${thinking ? 'status__pulse--on' : ''}`} aria-hidden />
        <span className="status__text">{message}</span>
      </div>
      <div className="status__score" aria-label="Score">
        <span className="status__score-item status__score-item--human">
          <span className="status__score-label">You</span>
          <span className="status__score-value">{score.human}</span>
        </span>
        <span className="status__score-item status__score-item--draw">
          <span className="status__score-label">Draw</span>
          <span className="status__score-value">{score.draw}</span>
        </span>
        <span className="status__score-item status__score-item--ai">
          <span className="status__score-label">EDSAC</span>
          <span className="status__score-value">{score.ai}</span>
        </span>
      </div>
    </div>
  );
}

function describe(state, thinking) {
  if (!state) return 'Booting…';
  if (state.status === 'win') {
    return state.winner === state.human_mark ? 'You win.' : 'EDSAC wins.';
  }
  if (state.status === 'draw') return 'Drawn game.';
  if (thinking) return 'EDSAC is thinking…';
  if (state.to_move === state.human_mark) return 'Your move.';
  return 'Awaiting EDSAC.';
}
