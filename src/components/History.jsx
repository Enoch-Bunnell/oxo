import React from 'react';

export default function History({ onPlay }) {
  return (
    <div className="history">
      <article className="history__card">
        <header className="history__year">
          <span className="history__year-place">Cambridge</span>
          <span className="history__year-number">1952</span>
        </header>

        <div className="history__body">
          <p>
            At the University Mathematical Laboratory, <strong>Alexander Shafto
            Douglas</strong> writes OXO as part of his PhD thesis on human–computer
            interaction — a field that, at the time, barely exists.
          </p>
          <p>
            His machine is the <strong>EDSAC</strong>: three thousand vacuum tubes,
            mercury delay-line memory, instructions fed in on paper tape. It fills
            a room. It draws the simplest shapes on a 35×16 cathode-ray dot matrix.
            The player makes a move by turning a rotary telephone dial — positions
            one through nine.
          </p>
          <p>
            Douglas can&apos;t fit a full search in EDSAC&apos;s tiny memory, so he
            encodes perfect play by hand, as a lookup table. The computer never
            loses. It will never lose.
          </p>
          <p>
            Almost no one ever plays it. EDSAC is one of a kind; when it is
            dismantled in 1958, the game goes with it. For decades it&apos;s a
            footnote — a thesis appendix. But it is also the first of its kind:
            a computer that draws a game, a computer that plays back. Every game
            you&apos;ll play after it descends from this one.
          </p>
        </div>

        <dl className="history__facts">
          <div className="history__fact">
            <dt>Author</dt>
            <dd>A. S. Douglas</dd>
          </div>
          <div className="history__fact">
            <dt>Machine</dt>
            <dd>EDSAC, Cambridge</dd>
          </div>
          <div className="history__fact">
            <dt>Display</dt>
            <dd>35 × 16 cathode-ray dots</dd>
          </div>
          <div className="history__fact">
            <dt>Input</dt>
            <dd>Rotary telephone dial</dd>
          </div>
        </dl>
      </article>

      <button type="button" className="btn btn--primary btn--play" onClick={onPlay}>
        Play
      </button>
    </div>
  );
}
