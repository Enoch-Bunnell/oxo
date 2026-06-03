import React from 'react';

// SVG glyphs for X and O.  Gradients are defined per-instance with unique IDs
// so multiple glyphs on the same page render correctly.
export default function Glyph({ mark, winning }) {
  const uid = React.useId();
  const stroke = 14;

  if (mark === 'X') {
    const gid = `x-grad-${uid}`;
    return (
      <svg className={`glyph glyph--x ${winning ? 'glyph--winning' : ''}`} viewBox="0 0 100 100">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7aa2ff" />
            <stop offset="55%" stopColor="#5e7fff" />
            <stop offset="100%" stopColor="#2af1ff" />
          </linearGradient>
          <filter id={`${gid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          filter={`url(#${gid}-glow)`}
        >
          <line className="glyph__stroke glyph__stroke--1" x1="22" y1="22" x2="78" y2="78" />
          <line className="glyph__stroke glyph__stroke--2" x1="78" y1="22" x2="22" y2="78" />
        </g>
      </svg>
    );
  }

  // O
  const gid = `o-grad-${uid}`;
  return (
    <svg className={`glyph glyph--o ${winning ? 'glyph--winning' : ''}`} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd27a" />
          <stop offset="55%" stopColor="#ff8a5e" />
          <stop offset="100%" stopColor="#ff5e9c" />
        </linearGradient>
        <filter id={`${gid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        className="glyph__stroke glyph__stroke--ring"
        cx="50"
        cy="50"
        r="28"
        stroke={`url(#${gid})`}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        filter={`url(#${gid}-glow)`}
      />
    </svg>
  );
}
