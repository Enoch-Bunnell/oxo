import React from 'react';
import Glyph from './Glyph.jsx';

export default function Cell({ index, mark, winning, interactive, onClick }) {
  const empty = mark === ' ';
  const classes = [
    'cell',
    empty ? 'cell--empty' : 'cell--filled',
    interactive ? 'cell--interactive' : '',
    winning ? 'cell--winning' : '',
    mark === 'X' ? 'cell--x' : '',
    mark === 'O' ? 'cell--o' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={interactive ? onClick : undefined}
      disabled={!interactive}
      aria-label={`Cell ${index + 1}${empty ? ' empty' : `, ${mark}`}`}
      style={{ '--cell-delay': `${index * 30}ms` }}
    >
      <span className="cell__inner">
        {!empty && <Glyph mark={mark} winning={winning} />}
      </span>
    </button>
  );
}
