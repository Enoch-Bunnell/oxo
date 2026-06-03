import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Board from './components/Board.jsx';
import StatusBar from './components/StatusBar.jsx';
import Controls from './components/Controls.jsx';
import History from './components/History.jsx';
import { rpc } from './api.js';

const INITIAL_SCORE = { human: 0, ai: 0, draw: 0 };

export default function App() {
  const [view, setView] = useState('history');
  const [state, setState] = useState(null);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState(null);
  const settledRef = useRef(null);

  const newGame = useCallback(async (opts = {}) => {
    setError(null);
    try {
      const next = await rpc.newGame({
        human_mark: opts.humanMark ?? state?.human_mark ?? 'X',
        difficulty: opts.difficulty ?? state?.difficulty ?? 'standard',
      });
      settledRef.current = null;
      setState(next);
      if (next.to_move === next.ai_mark) {
        setThinking(true);
        const after = await rpc.aiMove();
        setState(after);
        setThinking(false);
      }
    } catch (err) {
      setError(err.message ?? String(err));
      setThinking(false);
    }
  }, [state?.human_mark, state?.difficulty]);

  useEffect(() => {
    newGame({ humanMark: 'X', difficulty: 'standard' });
  }, []);

  const handleCellClick = useCallback(async (cell) => {
    if (!state || thinking) return;
    if (state.status !== 'playing') return;
    if (state.to_move !== state.human_mark) return;
    if (state.board[cell] !== ' ') return;

    setError(null);
    try {
      const afterHuman = await rpc.move(cell);
      setState(afterHuman);
      if (afterHuman.status !== 'playing') return;
      setThinking(true);
      // Brief pause so the AI doesn't feel instantaneous
      await new Promise((r) => setTimeout(r, 280));
      const afterAI = await rpc.aiMove();
      setState(afterAI);
    } catch (err) {
      setError(err.message ?? String(err));
    } finally {
      setThinking(false);
    }
  }, [state, thinking]);

  // Update the scoreboard exactly once per finished game.
  useEffect(() => {
    if (!state) return;
    if (state.status === 'playing') return;
    const key = `${state.status}:${state.winner}:${state.board.join('')}`;
    if (settledRef.current === key) return;
    settledRef.current = key;
    if (state.status === 'draw') {
      setScore((s) => ({ ...s, draw: s.draw + 1 }));
    } else if (state.winner === state.human_mark) {
      setScore((s) => ({ ...s, human: s.human + 1 }));
    } else if (state.winner === state.ai_mark) {
      setScore((s) => ({ ...s, ai: s.ai + 1 }));
    }
  }, [state]);

  const resetScore = useCallback(() => setScore(INITIAL_SCORE), []);

  const ready = state !== null;

  return (
    <div className="app">
      <div className="ambient" aria-hidden />
      <header className="app__header">
        <button
          type="button"
          className="app__home"
          onClick={() => setView('history')}
          aria-label="About OXO"
        >
          <span className="app__title">
            <span className="app__title-glyph app__title-glyph--o">O</span>
            <span className="app__title-glyph app__title-glyph--x">X</span>
            <span className="app__title-glyph app__title-glyph--o">O</span>
          </span>
        </button>
        <p className="app__subtitle">
          {view === 'history'
            ? 'A modern reinterpretation of Douglas’s 1952 EDSAC original.'
            : 'Your move against EDSAC.'}
        </p>
      </header>

      <main className="app__main">
        {view === 'history' ? (
          <History onPlay={() => setView('game')} />
        ) : (
          <>
            <StatusBar state={state} thinking={thinking} score={score} />
            <Board
              state={state}
              thinking={thinking}
              onCellClick={handleCellClick}
            />
            <Controls
              state={state}
              ready={ready}
              onNewGame={(opts) => newGame(opts)}
              onResetScore={resetScore}
            />
            {error && <div className="app__error" role="alert">{error}</div>}
          </>
        )}
      </main>

      <footer className="app__footer">
        <span>OXO &middot; A. S. Douglas, EDSAC, Cambridge, 1952</span>
      </footer>
    </div>
  );
}
