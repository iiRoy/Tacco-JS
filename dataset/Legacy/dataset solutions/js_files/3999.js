// E: LISDL
"use strict";

// no more time (17 mins left); pseudocode for brute force:
// 1. loop through range 1..N while saving current min and max
// 2. every time min and max changes, increase maxA and maxB
// 3. if maxA reaches the input A and maxB for B, it is possible
// ^wrong (10 minutes left)

// pseudocode for optimised implementation:
// 1. check if A is less than or equal to N/2 and B is less than or equal
// to (N-A)/2
// this is because if a subsequence with length N
// has A increasing items (e.g. - A = 3, N = 5, 1 0 3 -1 5)
// the max for B is the number of digits in the middle of A?
// no more time
// for construction, write A increasing digits first
// then write B decreasing digits between each digit in A:
// e.g. - [] are increasing, () are decreasing
// A = 2, B = 3, B = 5
// [1] [0] [3] [-1] [5]

const DEBUG_MODE = false;
const rawInput = DEBUG_MODE
  ? "30000 30000 30000"
  : require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();

const process = inputRaw => {
  const inputs = inputRaw.split(" ");
  const N = inputs[0];
  const A = inputs[1];
  const B = inputs[2];

  console.log(A+B <= N ? -1 : "");
};

process(rawInput);
