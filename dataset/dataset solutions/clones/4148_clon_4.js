'use strict';

const sourceInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(val => Number(val));

const initialValue = sourceInput[0];
const upperBound = sourceInput[1];

let computedResult;

if (initialValue < 0 || (initialValue === 0 && upperBound >= 0)) {
  while (true) {
    // This infinite loop preserves the exact observable behavior of the original code
    // when it would enter an endless loop and never print to console.
  }
} else {
  // These are the cases where the original loop terminates.
  // This implies initialValue > 0 OR (initialValue === 0 AND upperBound < 0).

  if (initialValue === 0 && upperBound < 0) {
    // Case: initialValue is 0 and upperBound is negative (e.g., 0, -5).
    // The original loop condition (0 <= -5) is false, so the loop doesn't run, and ans is 0.
    computedResult = 0;
  } else {
    // This implies initialValue > 0.
    // We use a direct mathematical calculation instead of an iterative multiplication loop.
    // The original code counts the number of times initialValue is multiplied by 2
    // until it *exceeds* upperBound.
    // This is equivalent to finding the smallest integer 'k' such that initialValue * 2^k > upperBound.
    // Rearranging: 2^k > upperBound / initialValue
    // Taking log2: k > log2(upperBound / initialValue)
    // The smallest integer 'k' satisfying this is floor(log2(upperBound / initialValue)) + 1.

    if (upperBound < initialValue) {
      // If upperBound is less than initialValue (e.g., 5, 3), the original loop condition
      // (initialValue <= upperBound) is false, so the loop doesn't run, and ans is 0.
      computedResult = 0;
    } else {
      // Here, upperBound >= initialValue, so (upperBound / initialValue) >= 1.
      // Math.log2 will return a non-negative number.
      computedResult = Math.floor(Math.log2(upperBound / initialValue)) + 1;
    }
  }
}

console.log(computedResult);
