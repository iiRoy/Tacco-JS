'use strict';

const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\s+/).map(Number);

let pointer = 0;
const N = input[pointer++];
const M = input[pointer++];

const balls = Array(N).fill(1);
const redBoxes = new Set([0]);

for (let i = 0; i < M; i++) {
   const from = input[pointer++] - 1;
   const to = input[pointer++] - 1;

   balls[from]--;
   balls[to]++;

   if (redBoxes.has(from)) {
      redBoxes.add(to);
   }

   if (balls[from] === 0) {
      redBoxes.delete(from);
   }
}

console.log(redBoxes.size);