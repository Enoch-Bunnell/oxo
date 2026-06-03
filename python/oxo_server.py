"""Long-running stdio JSON-RPC server spawned by Electron main.

Each line on stdin is a JSON-RPC request; each line on stdout is a response.
The protocol is a simplified subset of JSON-RPC 2.0 — id, method, params,
and either result or error.

Methods:
    new_game(human_mark="X", difficulty="standard") -> state
    move(cell)                                       -> state
    ai_move()                                        -> state
    state()                                          -> state
"""

import json
import sys
import traceback

from game import EMPTY, X, O, empty_board, winner, is_full, valid_moves, apply_move, opponent
from ai import choose_move, DIFFICULTY_BEST_RATE


class Session:
    def __init__(self):
        self.board = empty_board()
        self.human_mark = X
        self.ai_mark = O
        self.difficulty = "standard"
        self.to_move = X  # X always moves first

    def new_game(self, human_mark="X", difficulty="standard"):
        human_mark = human_mark.upper()
        if human_mark not in (X, O):
            raise ValueError(f"human_mark must be X or O, got {human_mark!r}")
        if difficulty not in DIFFICULTY_BEST_RATE:
            raise ValueError(f"unknown difficulty {difficulty!r}")
        self.board = empty_board()
        self.human_mark = human_mark
        self.ai_mark = opponent(human_mark)
        self.difficulty = difficulty
        self.to_move = X
        return self.state()

    def move(self, cell):
        win_mark, _ = winner(self.board)
        if win_mark is not None or is_full(self.board):
            raise ValueError("game already over")
        if self.to_move != self.human_mark:
            raise ValueError("not human's turn")
        apply_move(self.board, int(cell), self.human_mark)
        self.to_move = self.ai_mark
        return self.state()

    def ai_move(self):
        win_mark, _ = winner(self.board)
        if win_mark is not None or is_full(self.board):
            return self.state()
        if self.to_move != self.ai_mark:
            return self.state()
        cell = choose_move(self.board, self.ai_mark, self.difficulty)
        if cell is None:
            return self.state()
        apply_move(self.board, cell, self.ai_mark)
        self.to_move = self.human_mark
        return self.state()

    def state(self):
        win_mark, win_line = winner(self.board)
        if win_mark is not None:
            status = "win"
        elif is_full(self.board):
            status = "draw"
        else:
            status = "playing"
        return {
            "board": list(self.board),
            "human_mark": self.human_mark,
            "ai_mark": self.ai_mark,
            "difficulty": self.difficulty,
            "to_move": self.to_move,
            "status": status,
            "winner": win_mark,
            "win_line": list(win_line) if win_line else None,
            "valid_moves": valid_moves(self.board),
        }


def main():
    session = Session()
    methods = {
        "new_game": session.new_game,
        "move": session.move,
        "ai_move": session.ai_move,
        "state": session.state,
    }
    out = sys.stdout
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            method = req.get("method")
            params = req.get("params") or {}
            fn = methods.get(method)
            if fn is None:
                raise ValueError(f"unknown method {method!r}")
            result = fn(**params) if isinstance(params, dict) else fn(*params)
            response = {"jsonrpc": "2.0", "id": req.get("id"), "result": result}
        except Exception as exc:
            response = {
                "jsonrpc": "2.0",
                "id": req.get("id") if isinstance(req, dict) else None,
                "error": {"message": str(exc), "trace": traceback.format_exc()},
            }
        out.write(json.dumps(response) + "\n")
        out.flush()


if __name__ == "__main__":
    main()
