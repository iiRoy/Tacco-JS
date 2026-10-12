const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const n = nums[0];
const w = nums.slice(1);

const pref = [0];
for (let i = 0; i < n; i++) {
  pref[i + 1] = pref[i] + w[i];
}

function sum(l, r) {
  return pref[r] - pref[l];
}

const best = Array.from({ length: n }, () => Array(n).fill(0));

for (let length = 2; length <= n; length++) {
  for (let left = 0; left + length <= n; left++) {
    const right = left + length;
    let cur = Number.POSITIVE_INFINITY;

    for (let mid = left + 1; mid < right; mid++) {
      const value = best[left][mid] + best[mid][right] + sum(left, right);
      if (value < cur) {
        cur = value;
      }
    }

    best[left][right] = cur;
  }
}

process.stdout.write(String(best[0][n]));