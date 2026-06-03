// Bridge to the Python backend via Electron's preload.
// In dev (`npm run dev:vite` alone, no Electron) `window.oxo` is undefined —
// we fall back to an in-browser stub so the UI is still inspectable.

const bridge = typeof window !== 'undefined' ? window.oxo : undefined;

if (!bridge) {
  console.warn('[oxo] Electron bridge not present — using browser stub');
}

const stub = createBrowserStub();

export const rpc = {
  newGame: (opts) => (bridge ? bridge.newGame(opts) : stub.newGame(opts)),
  move: (cell) => (bridge ? bridge.move(cell) : stub.move(cell)),
  aiMove: () => (bridge ? bridge.aiMove() : stub.aiMove()),
  state: () => (bridge ? bridge.state() : stub.state()),
};

// Minimal client-side stub mirroring the Python server so the UI is usable
// when previewing in a plain browser. It is *not* the real game logic —
// it picks random AI moves and skips minimax entirely.
function createBrowserStub() {
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  let board = Array(9).fill(' ');
  let humanMark = 'X';
  let aiMark = 'O';
  let difficulty = 'standard';
  let toMove = 'X';

  function winner() {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] !== ' ' && board[a] === board[b] && board[a] === board[c]) {
        return { mark: board[a], line };
      }
    }
    return { mark: null, line: null };
  }

  function snapshot() {
    const w = winner();
    const full = !board.includes(' ');
    const status = w.mark ? 'win' : full ? 'draw' : 'playing';
    return {
      board: [...board],
      human_mark: humanMark,
      ai_mark: aiMark,
      difficulty,
      to_move: toMove,
      status,
      winner: w.mark,
      win_line: w.line,
      valid_moves: board.flatMap((c, i) => (c === ' ' ? [i] : [])),
    };
  }

  return {
    async newGame(opts = {}) {
      board = Array(9).fill(' ');
      humanMark = (opts.human_mark || 'X').toUpperCase();
      aiMark = humanMark === 'X' ? 'O' : 'X';
      difficulty = opts.difficulty || 'standard';
      toMove = 'X';
      return snapshot();
    },
    async move(cell) {
      if (board[cell] === ' ' && toMove === humanMark) {
        board[cell] = humanMark;
        toMove = aiMark;
      }
      return snapshot();
    },
    async aiMove() {
      const open = board.flatMap((c, i) => (c === ' ' ? [i] : []));
      if (open.length && !winner().mark && toMove === aiMark) {
        const pick = open[Math.floor(Math.random() * open.length)];
        board[pick] = aiMark;
        toMove = humanMark;
      }
      return snapshot();
    },
    async state() {
      return snapshot();
    },
  };
}
