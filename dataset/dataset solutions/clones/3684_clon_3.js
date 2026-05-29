'use strict';

const input = require("fs")
   .readFileSync("/dev/stdin", "utf8")
   .trim()
   .split(/\s+/)
   .map(Number);

const N = input[0];
const numbers = input.slice(1, N + 1);

const evenIndexValues = new Set();
const oddIndexValues = new Set();

numbers.forEach((value, index) => {
   if (index % 2 === 0) {
      evenIndexValues.add(value);
   } else {
      oddIndexValues.add(value);
   }
});

const sorted = Array.from(numbers).sort((a, b) => a - b);

let mismatch = 0;

sorted.forEach((value, index) => {
   if (index % 2 === 0 && !evenIndexValues.has(value)) {
      mismatch++;
   }

   if (index % 2 === 1 && !oddIndexValues.has(value)) {
      mismatch++;
   }
});

console.log(mismatch / 2);