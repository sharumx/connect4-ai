#pragma once
#include <array>
#include <vector>
#include <utility>

constexpr int ROWS = 6;
constexpr int COLS = 7;
constexpr int EMPTY = 0;
constexpr int PLAYER = 1;
constexpr int AI_PIECE = 2;
constexpr int INF = 1000000;

using Board = std::array<std::array<int, COLS>, ROWS>;

// Move ordering for better alpha-beta pruning (center-out)
constexpr int MOVE_ORDER[COLS] = {3, 2, 4, 1, 5, 0, 6};

bool isValidMove(const Board& board, int col);

// In-place drop; returns the row the piece landed on, or -1 if invalid
int dropPiece(Board& board, int col, int piece);

// Undo the topmost piece in a column
void undropPiece(Board& board, int col);

bool checkWin(const Board& board, int piece);
bool isBoardFull(const Board& board);
std::vector<int> getValidMoves(const Board& board);
std::vector<std::pair<int, int>> getWinningCells(const Board& board, int piece);
