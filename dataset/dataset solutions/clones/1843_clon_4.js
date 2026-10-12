const fs = require("fs");

const lines = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const n = lines[0];
const order = lines.slice(1);

const OUT = -2;
const GONE = -1;

const field = Array.from({ length: n }, (_, y) =>
  Array.from({ length: n }, (_, x) => Math.min(y, x, n - 1 - y, n - 1 - x))
);

let answer = 0;

const dirs = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];

function inside(y, x) {
  return y >= 0 && y < n && x >= 0 && x < n;
}

function touchesOutside(y, x) {
  for (const [dy, dx] of dirs) {
    const ny = y + dy;
    const nx = x + dx;
    if (!inside(ny, nx) || field[ny][nx] === OUT) return true;
  }
  return false;
}

function lowerFrom(sy, sx) {
  const used = Array.from({ length: n }, () => Array(n).fill(false));
  const stack = [[sy, sx]];

  while (stack.length) {
    const [y, x] = stack.pop();
    const level = field[y][x];

    for (const [dy, dx] of dirs) {
      const ny = y + dy;
      const nx = x + dx;

      if (!inside(ny, nx)) continue;
      if (used[ny][nx]) continue;
      if (field[ny][nx] > level) {
        used[ny][nx] = true;
        stack.push([ny, nx]);
        field[ny][nx]--;
      }
    }
  }
}

function openArea(sy, sx) {
  const seen = Array.from({ length: n }, () => Array(n).fill(false));
  const stack = [[sy, sx]];

  while (stack.length) {
    const [y, x] = stack.pop();
    if (!inside(y, x) || seen[y][x]) continue;
    seen[y][x] = true;

    if (field[y][x] !== GONE && field[y][x] !== OUT) continue;

    field[y][x] = OUT;

    for (const [dy, dx] of dirs) {
      const ny = y + dy;
      const nx = x + dx;

      if (!inside(ny, nx)) continue;

      if (field[ny][nx] >= 0) {
        field[ny][nx] = 0;
      } else if (!seen[ny][nx]) {
        stack.push([ny, nx]);
      }
    }
  }
}

for (const cell of order) {
  const index = cell - 1;
  const y = Math.floor(index / n);
  const x = index % n;

  answer += field[y][x];

  lowerFrom(y, x);
  field[y][x] = GONE;

  if (touchesOutside(y, x)) {
    openArea(y, x);
  }
}

process.stdout.write(String(answer));