'use strict';

const data = require("fs")
   .readFileSync("/dev/stdin", "utf8")
   .trim()
   .split(/\s+/)
   .map(Number);

const n = data[0];
const original = data.slice(1, n + 1);
const sorted = [...original].sort((a, b) => a - b);

const makeKey = (parity, value) => `${parity}:${value}`;

const before = new Map();
const after = new Map();

for (let i = 0; i < n; i++) {
   const originalKey = makeKey(i % 2, original[i]);
   const sortedKey = makeKey(i % 2, sorted[i]);

   before.set(originalKey, (before.get(originalKey) || 0) + 1);
   after.set(sortedKey, (after.get(sortedKey) || 0) + 1);
}

let misplaced = 0;

for (const [key, amount] of after) {
   const available = before.get(key) || 0;

   if (amount > available) {
      misplaced += amount - available;
   }
}

console.log(misplaced);