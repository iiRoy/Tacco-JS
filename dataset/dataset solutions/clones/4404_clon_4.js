'use strict'

function calculateRectangleArea(inputDataString) {
  const inputLines = inputDataString.split('\n');
  const barLengthStrings = inputLines[1].split(' ');
  const sortedNumericBarLengths = barLengthStrings.map(Number).sort((a, b) => b - a);

  let currentScanIndex = 0;
  let firstSideLength = null;
  let secondSideLength = null;

  while (currentScanIndex < sortedNumericBarLengths.length) {
    const currentBar = sortedNumericBarLengths[currentScanIndex];
    const nextBar = sortedNumericBarLengths[currentScanIndex + 1];
    const thirdBar = sortedNumericBarLengths[currentScanIndex + 2];
    const fourthBar = sortedNumericBarLengths[currentScanIndex + 3];

    // Prioritize finding four identical bars to form a square
    // This check ensures there are at least four bars available at the current position.
    if (fourthBar !== undefined && currentBar === nextBar && currentBar === thirdBar && currentBar === fourthBar) {
      return currentBar * currentBar;
    }

    // Look for a pair of identical bars
    // This check ensures there are at least two bars available at the current position.
    if (nextBar !== undefined && currentBar === nextBar) {
      if (firstSideLength === null) {
        firstSideLength = currentBar;
      } else if (secondSideLength === null) {
        secondSideLength = currentBar;
        return firstSideLength * secondSideLength; // Found two distinct pairs, calculate area and exit
      }
      // If a pair is found (and potentially used or ignored because two sides are already found),
      // advance the index by 2 to effectively "consume" both bars of the pair.
      currentScanIndex += 2;
    } else {
      // If no pair is found at the current position, advance the index by 1 to check the next bar.
      currentScanIndex += 1;
    }
  }
  return 0; // No valid rectangle could be formed from the given bars
}

function Main(input) {
  console.log(calculateRectangleArea(input));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
