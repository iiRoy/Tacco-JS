// This script calculates minimum counts of specific number sequences
// to sum up to a target value, using dynamic programming.

// First sequence: triangular numbers (shifted)
// `firstSequence[k]` stores the (k+1)-th triangular number.
let firstSequence = [1];
// Populate the first sequence up to a certain limit.
for (let currentIdx = 1; currentIdx < 100_000; currentIdx++) {
  firstSequence[currentIdx] = firstSequence[currentIdx - 1] + currentIdx + 1;
}

// Second sequence: tetrahedral numbers (shifted)
// `secondSequence[k]` stores the (k+1)-th tetrahedral number.
let secondSequence = [1];
let sequenceIndex = 1;
// Generate elements of the second sequence until a threshold is exceeded.
while (true) {
  secondSequence[sequenceIndex] = secondSequence[sequenceIndex - 1] + firstSequence[sequenceIndex];
  // Break if the current element surpasses the maximum target value.
  if (secondSequence[sequenceIndex] > 100_000) {
    break;
  }
  sequenceIndex++;
}

// Dynamic programming arrays for minimum counts.
// `minCountAll[k]` stores the minimum number of elements from `secondSequence`
// that sum up to `k`.
let minCountAll = [];
// `minCountOdd[k]` stores the minimum number of *odd* elements from `secondSequence`
// that sum up to `k`.
let minCountOdd = [];

// Initialize DP arrays with a large value (infinity) to represent unreachability.
const MAX_TARGET_VALUE = 100_000;
for (let k = 0; k < MAX_TARGET_VALUE; k++) {
  minCountAll[k] = Number.POSITIVE_INFINITY;
  minCountOdd[k] = Number.POSITIVE_INFINITY;
}

// Base cases: 0 can be formed with 0 elements.
minCountAll[0] = 0;
minCountOdd[0] = 0;

// Fill the DP tables.
// Iterate through all possible target values from 0 up to MAX_TARGET_VALUE - 1.
for (let currentTarget = 0; currentTarget < MAX_TARGET_VALUE; currentTarget++) {
  // For each target, consider using each number from the `secondSequence`.
  for (let elementIndex = 0; elementIndex < secondSequence.length; elementIndex++) {
    const currentElement = secondSequence[elementIndex];

    // Check if the current element can be subtracted from the target without going negative.
    if (currentTarget - currentElement >= 0) {
      // Update `minCountAll`: take the minimum of the current value
      // and (count for `currentTarget - currentElement` + 1).
      minCountAll[currentTarget] = Math.min(minCountAll[currentTarget - currentElement] + 1, minCountAll[currentTarget]);
    }

    // For `minCountOdd`, additionally check if the current element is odd.
    if (currentElement % 2 === 1 && currentTarget - currentElement >= 0) {
      // Update `minCountOdd`: similar logic, but only for odd elements.
      minCountOdd[currentTarget] = Math.min(minCountOdd[currentTarget - currentElement] + 1, minCountOdd[currentTarget]);
    }
  }
}

// Read input from standard input.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input: trim whitespace, split by newlines, convert to numbers.
const inputNumbers = rawData.trim().split("\n").map(Number);

// Process each target number from the input.
while (true) {
  // Get the next target number from the array.
  const targetNum = inputNumbers.shift();
  // If the target number is 0, it's the termination signal.
  if (targetNum === 0) {
    break;
  }
  // Output the results for the current target number.
  console.log(minCountAll[targetNum] + " " + minCountOdd[targetNum]);
}
