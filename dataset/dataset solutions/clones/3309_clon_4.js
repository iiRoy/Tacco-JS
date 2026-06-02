'use strict';

const source = require('fs').readFileSync('/dev/stdin', 'utf8');

function solve(raw) {
  const parts = raw.trim().split('\n');
  const a = parts[0];
  const b = parts[1];

  const rows = a.length + 1;
  const cols = b.length + 1;
  const score = Array.from({ length: rows }, () => new Int32Array(cols));

  for (let col = 1; col < cols; col++) {
    const chB = b[col - 1];
    for (let row = 1; row < rows; row++) {
      if (a[row - 1] === chB) {
        score[row][col] = score[row - 1][col - 1] + 1;
      } else {
        const skipB = score[row][col - 1];
        const skipA = score[row - 1][col];
        score[row][col] = skipB > skipA ? skipB : skipA;
      }
    }
  }

  const picked = [];
  let r = rows - 1;
  let c = cols - 1;

  while (r > 0 && c > 0) {
    if (a[r - 1] === b[c - 1]) {
      picked.push(a[r - 1]);
      r--;
      c--;
    } else {
      const fromLeft = score[r][c - 1];
      const fromUp = score[r - 1][c];
      if (fromLeft > fromUp) {
        c--;
      } else {
        r--;
      }
    }
  }

  return picked.reverse().join('');
}

console.log(solve(source));
