"use strict";

const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\s+/);

let index = 0;
const h = Number(input[index++]);
const w = Number(input[index++]);
const grid = input.slice(index, index + h);

const upper = Array.from({ length: h }, () => Array(w).fill("."));
const lower = Array.from({ length: h }, () => Array(w).fill("."));

for (let i = 0; i < h; i++) {
   upper[i][0] = "#";
   lower[i][w - 1] = "#";

   for (let j = 1; j < w - 1; j++) {
      if (i % 2 === 1) {
         upper[i][j] = "#";
      } else {
         lower[i][j] = "#";
      }

      if (grid[i][j] !== ".") {
         upper[i][j] = "#";
         lower[i][j] = "#";
      }
   }
}

const answer = [
   upper.map(row => row.join("")).join("\n"),
   "",
   lower.map(row => row.join("")).join("\n")
];

console.log(answer.join("\n"));