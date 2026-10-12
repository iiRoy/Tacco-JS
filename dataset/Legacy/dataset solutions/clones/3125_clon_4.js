"use strict";

function processInputAndSolve(rawInput) {
  const parsedData = rawInput.trim().split(/\s+/).map(Number);
  const totalElements = parsedData.shift();
  const moduloValue = Math.pow(10, 9) + 7;

  // The initial state for our reduction process.
  // 'dpValues' will store the dynamic programming results, where dpValues[k]
  // represents the number of ways to color up to index k.
  // 'priorOccurrences' is a Map that tracks the last seen index for each color,
  // replacing the large, pre-initialized array from the original.
  const initialAccumulator = {
    dpValues: [1], // Base case: dp[0] is 1 way (for the first element)
    priorOccurrences: new Map([[parsedData[0], 0]]) // Record the first color's position
  };

  // We use Array.prototype.reduce to iteratively build the dpValues array
  // and update the priorOccurrences map.
  // The 'parsedData' array, after shifting 'totalElements', contains the colors
  // from the original input's index 0 to N-1.
  // We slice it from the second element (index 1) because the first element (index 0)
  // was already handled in 'initialAccumulator'.
  const finalState = parsedData.slice(1).reduce((currentAccumulator, currentStoneColor, iterationIndex) => {
    // 'iterationIndex' here refers to the index within the sliced array (0, 1, 2, ...).
    // 'globalIndex' maps this back to the original problem's index (1, 2, 3, ...),
    // corresponding to 'i' in the original loop.
    const globalIndex = iterationIndex + 1;

    const previousIndexDp = currentAccumulator.dpValues[globalIndex - 1];
    const lastKnownPosition = currentAccumulator.priorOccurrences.get(currentStoneColor);

    let currentDpValue;
    // Check if the color is new (undefined in map) or if its last occurrence
    // was immediately before the current position.
    if (lastKnownPosition === undefined || lastKnownPosition === globalIndex - 1) {
      currentDpValue = previousIndexDp;
    } else {
      // If the color has appeared before, and not immediately before,
      // we sum the ways from the previous state and the ways up to the
      // last occurrence of this color.
      currentDpValue = (previousIndexDp + currentAccumulator.dpValues[lastKnownPosition]) % moduloValue;
    }

    // Store the calculated DP value for the current index.
    currentAccumulator.dpValues[globalIndex] = currentDpValue;
    // Update the last seen position for the current color.
    currentAccumulator.priorOccurrences.set(currentStoneColor, globalIndex);

    return currentAccumulator;
  }, initialAccumulator);

  // The final result is the DP value for the last element (index totalElements - 1).
  console.log(finalState.dpValues[totalElements - 1]);
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
