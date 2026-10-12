const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let p = 0;

const H = nums[p++];
const W = nums[p++];

const A = [];
for (let y = 0; y < H; y++) {
  A[y] = nums.slice(p, p + W);
  p += W;
}

const D = [];
let total = 0;
for (let y = 0; y < H; y++) {
  D[y] = [];
  for (let x = 0; x < W; x++) {
    const v = Math.abs(A[y][x] - nums[p++]);
    D[y][x] = v;
    total += v;
  }
}

const states = Array.from({ length: H }, () =>
  Array.from({ length: W }, () => new Set())
);

states[0][0].add(D[0][0]);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (y === 0 && x === 0) continue;

    const here = D[y][x];

    if (y > 0) {
      for (const prev of states[y - 1][x]) {
        states[y][x].add(Math.abs(prev + here));
        states[y][x].add(Math.abs(prev - here));
      }
    }

    if (x > 0) {
      for (const prev of states[y][x - 1]) {
        states[y][x].add(Math.abs(prev + here));
        states[y][x].add(Math.abs(prev - here));
      }
    }
  }
}

let answer = Infinity;
for (const v of states[H - 1][W - 1]) {
  if (v < answer) answer = v;
}

process.stdout.write(String(answer));