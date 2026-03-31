/**
 * Emscripten EMBIND bindings for the Connect-4 AI.
 *
 * Compile with:
 *   emcc connect4.cpp ai.cpp bindings.cpp \
 *     -O3 --bind \
 *     -s MODULARIZE=1 -s EXPORT_NAME='createConnect4Module' \
 *     -s ALLOW_MEMORY_GROWTH=1 -s NO_EXIT_RUNTIME=1 \
 *     -o ../public/wasm/connect4.js
 */
#include <emscripten/bind.h>
#include "connect4.hpp"
#include "ai.hpp"

using namespace emscripten;

// Helper: convert a flat JS array (row-major, ROWS*COLS ints) → Board
static Board boardFromVal(const val &arr)
{
    Board b{};
    for (int r = 0; r < ROWS; r++)
        for (int c = 0; c < COLS; c++)
            b[r][c] = arr[r * COLS + c].as<int>();
    return b;
}

// ─── Exported functions ───────────────────────────────────────────────────────

/** Returns the best column for `aiPiece`. */
int wasm_getBestMove(const val &boardArr, int depth, int aiPiece, int humanPiece)
{
    Board board = boardFromVal(boardArr);
    return getBestMove(board, depth, aiPiece, humanPiece).column;
}

/** Returns true if `piece` has won. */
bool wasm_checkWin(const val &boardArr, int piece)
{
    return checkWin(boardFromVal(boardArr), piece);
}

/** Returns true if the board is completely filled. */
bool wasm_isBoardFull(const val &boardArr)
{
    return isBoardFull(boardFromVal(boardArr));
}

/**
 * Returns a JS array of {row, col} objects for the winning four cells,
 * or an empty array if no win.
 */
val wasm_getWinningCells(const val &boardArr, int piece)
{
    auto cells = getWinningCells(boardFromVal(boardArr), piece);
    val result = val::array();
    for (auto &[r, c] : cells)
    {
        val cell = val::object();
        cell.set("row", r);
        cell.set("col", c);
        result.call<void>("push", cell);
    }
    return result;
}

// ─── Binding declarations ─────────────────────────────────────────────────────

EMSCRIPTEN_BINDINGS(connect4)
{
    function("getBestMove", &wasm_getBestMove);
    function("checkWin", &wasm_checkWin);
    function("isBoardFull", &wasm_isBoardFull);
    function("getWinningCells", &wasm_getWinningCells);
}
