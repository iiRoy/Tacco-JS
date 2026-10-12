const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const n = input[0];
const nums = input.slice(1, n + 1);

function gcd(a, b) {
  while (b !== 0) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

let allGcd = 0;
for (const v of nums) {
  allGcd = gcd(allGcd, v);
}

const limit = Math.max(...nums);
const smallest = Array(limit + 1);

for (let i = 0; i <= limit; i++) {
  smallest[i] = i;
}

for (let i = 2; i * i <= limit; i++) {
  if (smallest[i] !== i) continue;

  for (let j = i * i; j <= limit; j += i) {
    if (smallest[j] === j) {
      smallest[j] = i;
    }
  }
}

const used = new Set();
let pairwise = true;

for (const value of nums) {
  let x = value;
  let previous = 0;

  while (x > 1) {
    const p = smallest[x];

    if (p !== previous) {
      if (used.has(p)) {
        pairwise = false;
        break;
      }
      used.add(p);
      previous = p;
    }

    while (x % p === 0) {
      x = Math.floor(x / p);
    }
  }

  if (!pairwise) break;
}

if (pairwise) {
  console.log("pairwise coprime");
} else if (allGcd === 1) {
  console.log("setwise coprime");
} else {
  console.log("not coprime");
}