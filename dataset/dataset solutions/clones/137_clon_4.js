function determineBoundary(portions, factorOne, factorTwo) {
  const totalMagnitude = portions.reduce((accumulator, currentPortion) => accumulator + currentPortion, 0);
  const denominator = factorOne + factorTwo;
  const thresholdPoint = (totalMagnitude * factorOne) / denominator;

  // Handle specific edge cases to match the original's implicit return behavior
  if (isNaN(thresholdPoint)) {
    // The original `cross` function returns 1 if `x` is NaN.
    return 1;
  }
  if (thresholdPoint === Infinity && portions.length > 0) {
    // The original `cross` function returns `undefined` if `x` is Infinity and `l` is not empty.
    return undefined;
  }
  // If `thresholdPoint` is `-Infinity`, the `findSection` logic below will correctly
  // return 1 (as `-Infinity` is less than or equal to any positive `updatedAccumulation`),
  // which matches the original's behavior.
  // If `thresholdPoint` is `Infinity` and `portions` is empty, `totalMagnitude` would be 0,
  // making `thresholdPoint` NaN (0 * Inf), which is handled by the `isNaN` check.

  function findSection(remainingPortions, accumulatedValue, currentOrdinal) {
    if (remainingPortions.length === 0) {
      // If all portions have been processed and `thresholdPoint` is still
      // greater than `accumulatedValue` (total sum of `portions`),
      // it means the threshold is beyond the last segment.
      // The original code would return `l.length + 1`.
      return currentOrdinal + 1;
    }
    const currentPortionHead = remainingPortions[0];
    const updatedAccumulation = accumulatedValue + currentPortionHead;
    if (thresholdPoint <= updatedAccumulation) {
      // The threshold point falls within this section (1-indexed position).
      return currentOrdinal + 1;
    }
    // Recursively search in the rest of the portions
    return findSection(remainingPortions.slice(1), updatedAccumulation, currentOrdinal + 1);
  }

  return findSection(portions, 0, 0);
}

function processInput(fullInputString) {
  const lineResults = fullInputString.split('\n')
                                     .filter(line => line.trim() !== '') // Remove empty lines
                                     .map(lineText => {
                                         const numericTokens = lineText.split(',').map(parseFloat);
                                         const secondaryComponent = numericTokens[numericTokens.length - 1];
                                         const primaryComponent = numericTokens[numericTokens.length - 2];
                                         const primarySeries = numericTokens.slice(0, numericTokens.length - 2);
                                         return determineBoundary(primarySeries, primaryComponent, secondaryComponent);
                                     });
  console.log(lineResults.join('\n'));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));