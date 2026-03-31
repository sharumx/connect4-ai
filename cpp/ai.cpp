#include "ai.hpp"
#include <algorithm>
#include <climits>

// ─── Evaluation helpers ───────────────────────────────────────────────────────

/**
 * Score a single window of 4 cells for `piece` vs `opp`.
 * Returns positive if good for piece, negative if good for opponent.
 */
static int scoreWindow(int a, int b, int c, int d, int piece, int opp)
{
    int p = 0, e = 0, o = 0;
    int w[4] = {a, b, c, d};
    for (int v : w)
    {
        if (v == piece)
            p++;
        else if (v == EMPTY)
            e++;
        else
            o++;
    }
    if (p == 4)
        return 100;
    if (p == 3 && e == 1)
        return 5;
    if (p == 2 && e == 2)
        return 2;
    if (o == 3 && e == 1)
        return -4;
    return 0;
}

/**
 * Heuristic board evaluation.
 * Scores center-column control plus all horizontal/vertical/diagonal windows.
 */
static int evaluateBoard(const Board &board, int piece, int opp)
{
    int score = 0;

    // Center column preference
    int center = COLS / 2;
    for (int r = 0; r < ROWS; r++)
        if (board[r][center] == piece)
            score += 3;

    // Horizontal windows
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c <= COLS - 4; c++)
            score += scoreWindow(board[r][c], board[r][c + 1],
                                 board[r][c + 2], board[r][c + 3], piece, opp);

    // Vertical windows
    for (int c = 0; c < COLS; c++)
        for (int r = 0; r <= ROWS - 4; r++)
            score += scoreWindow(board[r][c], board[r + 1][c],
                                 board[r + 2][c], board[r + 3][c], piece, opp);

    // Positive-diagonal windows (↗)
    for (int r = 0; r <= ROWS - 4; r++)
        for (int c = 0; c <= COLS - 4; c++)
            score += scoreWindow(board[r][c], board[r + 1][c + 1],
                                 board[r + 2][c + 2], board[r + 3][c + 3], piece, opp);

    // Negative-diagonal windows (↘)
    for (int r = 3; r < ROWS; r++)
        for (int c = 0; c <= COLS - 4; c++)
            score += scoreWindow(board[r][c], board[r - 1][c + 1],
                                 board[r - 2][c + 2], board[r - 3][c + 3], piece, opp);

    return score;
}

// ─── Minimax with alpha-beta pruning ─────────────────────────────────────────

static int minimax(Board &board, int depth, int alpha, int beta,
                   bool maximizing, int aiPiece, int humanPiece)
{
    // Terminal-state checks
    if (checkWin(board, aiPiece))
        return INF + depth; // winning sooner is better
    if (checkWin(board, humanPiece))
        return -INF - depth;
    if (isBoardFull(board) || depth == 0)
        return evaluateBoard(board, aiPiece, humanPiece);

    auto moves = getValidMoves(board);

    if (maximizing)
    {
        int best = -INF * 2;
        for (int col : moves)
        {
            dropPiece(board, col, aiPiece);
            int s = minimax(board, depth - 1, alpha, beta, false, aiPiece, humanPiece);
            undropPiece(board, col);
            best = std::max(best, s);
            alpha = std::max(alpha, best);
            if (alpha >= beta)
                break; // β-cutoff
        }
        return best;
    }
    else
    {
        int best = INF * 2;
        for (int col : moves)
        {
            dropPiece(board, col, humanPiece);
            int s = minimax(board, depth - 1, alpha, beta, true, aiPiece, humanPiece);
            undropPiece(board, col);
            best = std::min(best, s);
            beta = std::min(beta, best);
            if (alpha >= beta)
                break; // α-cutoff
        }
        return best;
    }
}

// ─── Public API ──────────────────────────────────────────────────────────────

AIResult getBestMove(const Board &board, int depth, int aiPiece, int humanPiece)
{
    auto moves = getValidMoves(board);
    int bestScore = -INF * 2;
    int bestCol = moves[0];

    for (int col : moves)
    {
        Board tmp = board; // copy so we don't modify the original
        dropPiece(tmp, col, aiPiece);
        int score = minimax(tmp, depth - 1, -INF * 2, INF * 2, false, aiPiece, humanPiece);
        if (score > bestScore)
        {
            bestScore = score;
            bestCol = col;
        }
    }
    return {bestCol, bestScore};
}
