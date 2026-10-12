const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let p = 0;

const h = nums[p++];
const w = nums[p++];

const a = Array.from({ length: h }, () => Array(w));

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    a[y][x] = nums[p++];
  }
}

const diff = Array.from({ length: h }, () => Array(w));

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    diff[y][x] = Math.abs(a[y][x] - nums[p++]);
  }
}

const states = Array.from({ length: h }, () =>
  Array.from({ length: w }, () => new Set())
);

states[0][0].add(diff[0][0]);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const current = states[y][x];

    if (y + 1 < h) {
      const value = diff[y + 1][x];
      for (const s of current) {
        states[y + 1][x].add(Math.abs(s + value));
        states[y + 1][x].add(Math.abs(s - value));
      }
    }

    if (x + 1 < w) {
      const value = diff[y][x + 1];
      for (const s of current) {
        states[y][x + 1].add(Math.abs(s + value));
        states[y][x + 1].add(Math.abs(s - value));
      }
    }
  }
}

let answer = Infinity;

for (const value of states[h - 1][w - 1]) {
  if (value < answer) {
    answer = value;
  }
}

console.log(answer);