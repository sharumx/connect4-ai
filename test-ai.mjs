// AI smoke tests — runs pure JS, no TS transform needed
const rows = 6, cols = 7;

function drop(b, col, p) {
  for (let r = rows-1; r >= 0; r--) if (b[r][col] === 0) { b[r][col] = p; return r; }
  return -1;
}
function undrop(b, col) {
  for (let r = 0; r < rows; r++) if (b[r][col] !== 0) { b[r][col] = 0; return; }
}
function wins(b, p) {
  for (let r = 0; r < rows; r++)
    for (let c = 0; c <= cols-4; c++)
      if (b[r][c]===p && b[r][c+1]===p && b[r][c+2]===p && b[r][c+3]===p) return true;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r <= rows-4; r++)
      if (b[r][c]===p && b[r+1][c]===p && b[r+2][c]===p && b[r+3][c]===p) return true;
  for (let r = 0; r <= rows-4; r++)
    for (let c = 0; c <= cols-4; c++)
      if (b[r][c]===p && b[r+1][c+1]===p && b[r+2][c+2]===p && b[r+3][c+3]===p) return true;
  for (let r = 3; r < rows; r++)
    for (let c = 0; c <= cols-4; c++)
      if (b[r][c]===p && b[r-1][c+1]===p && b[r-2][c+2]===p && b[r-3][c+3]===p) return true;
  return false;
}
function scoreW(a, b, c, d, p, o) {
  let pv = 0, e = 0, ov = 0;
  for (const v of [a, b, c, d]) {
    if (v === p) pv++; else if (v === 0) e++; else if (v === o) ov++;
  }
  if (pv === 4) return 100;
  if (pv === 3 && e === 1) return 5;
  if (pv === 2 && e === 2) return 2;
  if (ov === 3 && e === 1) return -4;
  return 0;
}
function evalB(b, p, o) {
  let s = 0;
  const cen = Math.floor(cols / 2);
  for (let r = 0; r < rows; r++) if (b[r][cen] === p) s += 3;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c <= cols-4; c++) s += scoreW(b[r][c], b[r][c+1], b[r][c+2], b[r][c+3], p, o);
  for (let c = 0; c < cols; c++)
    for (let r = 0; r <= rows-4; r++) s += scoreW(b[r][c], b[r+1][c], b[r+2][c], b[r+3][c], p, o);
  for (let r = 0; r <= rows-4; r++)
    for (let c = 0; c <= cols-4; c++) s += scoreW(b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3], p, o);
  for (let r = 3; r < rows; r++)
    for (let c = 0; c <= cols-4; c++) s += scoreW(b[r][c], b[r-1][c+1], b[r-2][c+2], b[r-3][c+3], p, o);
  return s;
}
const ORDER = [3, 2, 4, 1, 5, 0, 6];
function validMoves(b) { return ORDER.filter(c => b[0][c] === 0); }
function minimax(b, depth, alpha, beta, max, ai, hu) {
  if (wins(b, ai)) return 100000 + depth;
  if (wins(b, hu)) return -100000 - depth;
  if (b[0].every(c => c !== 0) || depth === 0) return evalB(b, ai, hu);
  const ms = validMoves(b);
  if (max) {
    let best = -Infinity;
    for (const c of ms) {
      drop(b, c, ai);
      const s = minimax(b, depth-1, alpha, beta, false, ai, hu);
      undrop(b, c);
      if (s > best) best = s;
      if (s > alpha) alpha = s;
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const c of ms) {
      drop(b, c, hu);
      const s = minimax(b, depth-1, alpha, beta, true, ai, hu);
      undrop(b, c);
      if (s < best) best = s;
      if (s < beta) beta = s;
      if (alpha >= beta) break;
    }
    return best;
  }
}
function getBest(b, depth, ai, hu) {
  const ms = validMoves(b);
  let best = -Infinity, bestCol = ms[0];
  for (const c of ms) {
    drop(b, c, ai);
    const s = minimax(b, depth-1, -Infinity, Infinity, false, ai, hu);
    undrop(b, c);
    if (s > best) { best = s; bestCol = c; }
  }
  return bestCol;
}

function mkBoard() { return Array.from({length: rows}, () => new Array(cols).fill(0)); }

let passed = 0, failed = 0;
function test(name, got, expected) {
  if (got === expected) { console.log(`  ✅ ${name}: PASS (col ${got})`); passed++; }
  else { console.log(`  ❌ ${name}: FAIL — got col ${got}, expected col ${expected}`); failed++; }
}

// T1: AI wins immediately (3 in a row → AI should play to complete)
const b1 = mkBoard();
drop(b1, 3, 2); drop(b1, 4, 2); drop(b1, 5, 2); // AI has cols 3,4,5 → play 2 or 6
const m1 = getBest(b1, 3, 2, 1);
if (m1 === 2 || m1 === 6) { console.log(`  ✅ T1 (AI wins): PASS (col ${m1})`); passed++; }
else { console.log(`  ❌ T1 (AI wins): FAIL got col ${m1}`); failed++; }

// T2: AI blocks human 3-in-a-row
const b2 = mkBoard();
drop(b2, 0, 1); drop(b2, 1, 1); drop(b2, 2, 1); // Human has cols 0,1,2 → AI blocks col 3
test('T2 (Block human)', getBest(b2, 3, 2, 1), 3);

// T3: Empty board → AI picks center column (3)
test('T3 (Center preference)', getBest(mkBoard(), 2, 2, 1), 3);

// T4: Win detection
const b4 = mkBoard();
drop(b4, 0, 1); drop(b4, 1, 1); drop(b4, 2, 1); drop(b4, 3, 1);
if (wins(b4, 1)) { console.log('  ✅ T4 (win detection): PASS'); passed++; }
else { console.log('  ❌ T4 (win detection): FAIL'); failed++; }

// T5: No false positive win on empty board
if (!wins(mkBoard(), 1) && !wins(mkBoard(), 2)) {
  console.log('  ✅ T5 (no false win): PASS'); passed++;
} else { console.log('  ❌ T5 (no false win): FAIL'); failed++; }

// T6: Full-board draw detection
const b6 = mkBoard();
let col6 = 0;
for (let i = 0; i < rows * cols; i++) { drop(b6, col6 % cols, (i % 2) + 1); col6++; }
const full6 = b6[0].every(c => c !== 0);
if (full6) { console.log('  ✅ T6 (full board): PASS'); passed++; }
else { console.log('  ❌ T6 (full board): FAIL'); failed++; }

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
