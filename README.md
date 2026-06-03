# OXO

A stylized modern take on **OXO**, the tic-tac-toe game written by A. S. Douglas in 1952 on Cambridge's EDSAC. The original is widely cited as the first computer game to use a graphical display — a 35×16 cathode-ray dot matrix — and it played a perfect game of noughts and crosses as part of Douglas's PhD thesis on human-computer interaction.

This isn't a recreation. There are no scanlines, no green phosphor, no rotary-dial input. The board is rendered the way OXO might look if it shipped today: a quiet glass surface, soft ambient gradients, X and O drawn in opposing cool/warm strokes, and a status line that names the opponent honestly — *EDSAC*.

## Design

- **Modern, not retro.** Deep neutral background with drifting ambient haze, frosted-glass tiles, gradient-stroked SVG glyphs. The X uses a cool blue→cyan gradient; the O uses a warm amber→coral gradient. Together they carry the visual identity without any 50s pastiche.
- **Honest AI.** The 1952 OXO played perfect tic-tac-toe — minimax was implicit in the lookup tables Douglas hand-built. This version uses a real minimax search at three settings: *Casual* (mostly random), *Standard* (best move 75% of the time), and *Unbeatable* (the 1952 default — you cannot win, only draw).
- **No CRT effects.** The visual language is contemporary product design, not a costume of its history.

## Stack

- **Electron** — desktop shell
- **React + Vite** — renderer
- **Python (stdlib only)** — game state and minimax AI, run as a long-running subprocess
- **stdio JSON-RPC** — bridge between Electron's main process and Python; no localhost ports, no network surface

```
oxo/
├── electron/      # main.cjs spawns Python; preload.cjs exposes window.oxo
├── python/        # game.py, ai.py, oxo_server.py (the JSON-RPC loop)
└── src/           # React app — App.jsx, components/, styles.css
```

## Run

```bash
npm install
npm run dev
```

`npm run dev` launches Vite on `:5173` and Electron once the dev server is up. Electron spawns the Python subprocess automatically — make sure `py` (Windows) or `python3` (macOS/Linux) is on your PATH. The Python side has zero pip dependencies; it uses only the standard library.

For a production build:

```bash
npm start
```

## About the original

- **Author:** Alexander Shafto Douglas
- **Year:** 1952
- **Machine:** EDSAC, University of Cambridge Mathematical Laboratory
- **Display:** 35×16 cathode-ray dot matrix
- **Input:** rotary telephone dial (positions 1–9)
- **Context:** PhD thesis on the human-computer interaction problem

OXO was never widely played — it ran on a single one-of-a-kind machine — but it sits at the start of the lineage every game made since has been built on top of.

## License

MIT.
