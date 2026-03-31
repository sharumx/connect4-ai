#pragma once
#include "connect4.hpp"

struct AIResult
{
    int column;
    int score;
};

/**
 * Compute the best column for aiPiece to play.
 * Uses Minimax with alpha-beta pruning.
 * Difficulty levels (recommended depth):
 *   Easy:   2
 *   Medium: 4
 *   Hard:   7
 */
AIResult getBestMove(const Board &board, int depth, int aiPiece, int humanPiece);
