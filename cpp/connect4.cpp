#include "connect4.hpp"
#include <algorithm>

bool isValidMove(const Board &board, int col)
{
    return col >= 0 && col < COLS && board[0][col] == EMPTY;
}

int dropPiece(Board &board, int col, int piece)
{
    for (int row = ROWS - 1; row >= 0; row--)
    {
        if (board[row][col] == EMPTY)
        {
            board[row][col] = piece;
            return row;
        }
    }
    return -1;
}

void undropPiece(Board &board, int col)
{
    for (int row = 0; row < ROWS; row++)
    {
        if (board[row][col] != EMPTY)
        {
            board[row][col] = EMPTY;
            return;
        }
    }
}

bool checkWin(const Board &board, int piece)
{
    // Horizontal
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c <= COLS - 4; c++)
            if (board[r][c] == piece && board[r][c + 1] == piece &&
                board[r][c + 2] == piece && board[r][c + 3] == piece)
                return true;

    // Vertical
    for (int c = 0; c < COLS; c++)
        for (int r = 0; r <= ROWS - 4; r++)
            if (board[r][c] == piece && board[r + 1][c] == piece &&
                board[r + 2][c] == piece && board[r + 3][c] == piece)
                return true;

    // Positive diagonal (↗)
    for (int r = 0; r <= ROWS - 4; r++)
        for (int c = 0; c <= COLS - 4; c++)
            if (board[r][c] == piece && board[r + 1][c + 1] == piece &&
                board[r + 2][c + 2] == piece && board[r + 3][c + 3] == piece)
                return true;

    // Negative diagonal (↘)
    for (int r = 3; r < ROWS; r++)
        for (int c = 0; c <= COLS - 4; c++)
            if (board[r][c] == piece && board[r - 1][c + 1] == piece &&
                board[r - 2][c + 2] == piece && board[r - 3][c + 3] == piece)
                return true;

    return false;
}

bool isBoardFull(const Board &board)
{
    for (int c = 0; c < COLS; c++)
        if (board[0][c] == EMPTY)
            return false;
    return true;
}

std::vector<int> getValidMoves(const Board &board)
{
    std::vector<int> moves;
    for (int col : MOVE_ORDER)
        if (isValidMove(board, col))
            moves.push_back(col);
    return moves;
}

std::vector<std::pair<int, int>> getWinningCells(const Board &board, int piece)
{
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c <= COLS - 4; c++)
            if (board[r][c] == piece && board[r][c + 1] == piece &&
                board[r][c + 2] == piece && board[r][c + 3] == piece)
                return {{r, c}, {r, c + 1}, {r, c + 2}, {r, c + 3}};

    for (int c = 0; c < COLS; c++)
        for (int r = 0; r <= ROWS - 4; r++)
            if (board[r][c] == piece && board[r + 1][c] == piece &&
                board[r + 2][c] == piece && board[r + 3][c] == piece)
                return {{r, c}, {r + 1, c}, {r + 2, c}, {r + 3, c}};

    for (int r = 0; r <= ROWS - 4; r++)
        for (int c = 0; c <= COLS - 4; c++)
            if (board[r][c] == piece && board[r + 1][c + 1] == piece &&
                board[r + 2][c + 2] == piece && board[r + 3][c + 3] == piece)
                return {{r, c}, {r + 1, c + 1}, {r + 2, c + 2}, {r + 3, c + 3}};

    for (int r = 3; r < ROWS; r++)
        for (int c = 0; c <= COLS - 4; c++)
            if (board[r][c] == piece && board[r - 1][c + 1] == piece &&
                board[r - 2][c + 2] == piece && board[r - 3][c + 3] == piece)
                return {{r, c}, {r - 1, c + 1}, {r - 2, c + 2}, {r - 3, c + 3}};

    return {};
}
