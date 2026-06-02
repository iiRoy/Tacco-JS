'use strict';

const values = require("fs")
   .readFileSync("/dev/stdin", "utf8")
   .trim()
   .split(/\s+/)
   .map(Number);

const n = values[0];
const m = values[1];

const amount = Array(n).fill(1);
const mayHaveRed = Array(n).fill(false);

mayHaveRed[0] = true;

let index = 2;

for (let i = 0; i < m; i++) {
   const source = values[index++] - 1;
   const target = values[index++] - 1;

   const redCanMove = mayHaveRed[source];

   amount[source] -= 1;
   amount[target] += 1;

   if (redCanMove) {
      mayHaveRed[target] = true;
   }

   if (amount[source] === 0) {
      mayHaveRed[source] = false;
   }
}

const answer = mayHaveRed.filter(Boolean).length;
console.log(answer);