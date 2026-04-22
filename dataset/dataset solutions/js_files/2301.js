"use strict";
const fs = require("fs");

const winningHands = {
  r: "P",
  s: "R",
  p: "S"
};
const lines = fs.readFileSync("/dev/stdin", { encoding: "utf8" }).split("\n");
const firstLine = lines[0].split(" ");
const secondLine = lines[1].split(" ");
const N = parseInt(firstLine[0]);
const K = parseInt(firstLine[1]);
const R = parseInt(secondLine[0]);
const S = parseInt(secondLine[1]);
const P = parseInt(secondLine[2]);
const T = lines[2];

const POINTS = { R, S, P };

let answer = 0;
for (let k = 0; k < K; ++k) {
  answer += sub(k, K);
}
console.log(answer);

function sub(offset, stride) {
  let totalScore = 0;
  let prevHand = null;
  let cnt = 0;
  for (let t = offset; t < T.length; t += stride) {
    const winningHand = winningHands[T[t]];
    if (winningHand !== prevHand) {
      if (prevHand) {
        totalScore += POINTS[prevHand] * Math.floor((cnt + 1) / 2);
      }
      cnt = 0;
    }
    prevHand = winningHand;
    cnt++;
  }
  if (prevHand) {
    totalScore += POINTS[prevHand] * Math.floor((cnt + 1) / 2);
  }
  return totalScore;
}
