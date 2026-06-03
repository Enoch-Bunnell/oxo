"""Minimax AI for OXO.

OXO on the EDSAC played a perfect game — this module does too, with three
difficulty knobs that introduce controlled imperfection for human play:

    unbeatable  — pure minimax, never loses
    standard    — best move 75% of the time, otherwise random
    casual      — best move 30% of the time, otherwise random
"""

import random
from functools import lru_cache

from game import EMPTY, valid_moves, winner, is_full, opponent

DIFFICULTY_BEST_RATE = {
    "casual": 0.30,
    "standard": 0.75,
    "unbeatable": 1.0,
}


def choose_move(board, ai_mark, difficulty="standard"):
    moves = valid_moves(board)
    if not moves:
        return None
    rate = DIFFICULTY_BEST_RATE.get(difficulty, 1.0)
    if random.random() < rate:
        return _best_move(tuple(board), ai_mark)
    return random.choice(moves)


def _best_move(board_tuple, ai_mark):
    _, move = _minimax(board_tuple, ai_mark, ai_mark)
    return move


@lru_cache(maxsize=None)
def _minimax(board_tuple, to_move, ai_mark):
    """Return (score, best_cell) from `to_move`'s perspective.

    Score is from the AI's perspective: +1 AI wins, -1 AI loses, 0 draw.
    """
    win_mark, _ = winner(list(board_tuple))
    if win_mark == ai_mark:
        return 1, None
    if win_mark == opponent(ai_mark):
        return -1, None
    if is_full(list(board_tuple)):
        return 0, None

    maximizing = to_move == ai_mark
    best_score = -2 if maximizing else 2
    best_cell = None

    for i, cell in enumerate(board_tuple):
        if cell != EMPTY:
            continue
        new_board = list(board_tuple)
        new_board[i] = to_move
        score, _ = _minimax(tuple(new_board), opponent(to_move), ai_mark)
        if maximizing:
            if score > best_score:
                best_score, best_cell = score, i
                if best_score == 1:
                    break
        else:
            if score < best_score:
                best_score, best_cell = score, i
                if best_score == -1:
                    break

    return best_score, best_cell
