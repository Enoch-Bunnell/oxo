"""Board state and win detection for OXO.

The board is a list of nine single-character strings — ' ', 'X', or 'O' —
indexed 0..8 in reading order:

    0 | 1 | 2
    ---------
    3 | 4 | 5
    ---------
    6 | 7 | 8
"""

EMPTY = " "
X = "X"
O = "O"

WIN_LINES = (
    (0, 1, 2), (3, 4, 5), (6, 7, 8),
    (0, 3, 6), (1, 4, 7), (2, 5, 8),
    (0, 4, 8), (2, 4, 6),
)


def empty_board():
    return [EMPTY] * 9


def opponent(mark):
    return O if mark == X else X


def winner(board):
    """Return (mark, line) for a completed line, or (None, None)."""
    for line in WIN_LINES:
        a, b, c = line
        if board[a] != EMPTY and board[a] == board[b] == board[c]:
            return board[a], line
    return None, None


def is_full(board):
    return EMPTY not in board


def valid_moves(board):
    return [i for i, c in enumerate(board) if c == EMPTY]


def apply_move(board, cell, mark):
    if not (0 <= cell <= 8):
        raise ValueError(f"cell {cell} out of range")
    if board[cell] != EMPTY:
        raise ValueError(f"cell {cell} already occupied")
    board[cell] = mark
