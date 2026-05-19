"use strict";

function executeNumberSequence() {
  const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8");
  const dataLines = sourceContent.split("\n");

  // Extract the single integer value from the first line.
  // The original used a helper 'splitNum' which was more general,
  // but for a single number, direct parsing is sufficient and distinct.
  const iterationCount = parseInt(dataLines[0], 10);

  // The original code maintained state with 'cur' (current digit) and 'suffix' (power of 10 as string).
  // This implementation calculates the value directly for each iteration.
  // For an iteration 'k' (0-indexed):
  // The base digit (1-9) is derived from (k % 9) + 1.
  // The power of ten (1, 10, 100, ...) is derived from 10 raised to the power of floor(k / 9).

  for (let sequenceIndex = 0; sequenceIndex < iterationCount; ++sequenceIndex) {
    // Determine the current single digit (1 through 9)
    const baseDigit = (sequenceIndex % 9) + 1;

    // Determine the exponent for the power of 10 (0, 1, 2, ...)
    const exponentValue = Math.floor(sequenceIndex / 9);

    // Calculate the final number for this step
    const computedValue = baseDigit * Math.pow(10, exponentValue);

    console.log(computedValue);
  }
}

executeNumberSequence();
