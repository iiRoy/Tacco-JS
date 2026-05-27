function ProcessInput(rawData) {
  const lineSegments = rawData.split("\n");
  const elementCount = parseInt(lineSegments[0], 10);
  const numericSequence = lineSegments[1].split(" ").map(val => parseInt(val, 10));

  const finalAdjustmentResult = numericSequence.reduce((accumulator, currentVal, idx, fullArr) => {
    let { currentAdjustedSum, totalModifications } = accumulator;

    // `previousIterationAdjustedSum` holds the `acc` value *after* adjustment from the previous iteration.
    // This corresponds to `arr[i-1]` in the original logic for `idx > 0`.
    const previousIterationAdjustedSum = currentAdjustedSum;

    // `rawCumulativeSum` is the sum of elements up to the current one, *before* any adjustment
    // for the current iteration. This corresponds to `acc += a[i]` in the original.
    let rawCumulativeSum = currentAdjustedSum + currentVal;

    let adjustedValueForCurrentIteration = rawCumulativeSum;
    let modificationsMadeThisIteration = 0;

    if (idx === 0) {
      // Special handling for the very first element (index 0)
      if (adjustedValueForCurrentIteration === 0) {
        // If the first element (a[0]) is 0, we need to adjust it based on the sign of a[1].
        // Note: fullArr[idx + 1] accesses a[1]. If n=1, this will be undefined,
        // leading to NaN in calculations, which matches original behavior.
        if (fullArr[idx + 1] >= 0) {
          // If a[1] is non-negative, adjust `adjustedValueForCurrentIteration` to be negative.
          adjustedValueForCurrentIteration -= (fullArr[idx + 1] - 1);
          if (adjustedValueForCurrentIteration === 0) adjustedValueForCurrentIteration--;
          modificationsMadeThisIteration = Math.abs(adjustedValueForCurrentIteration);
        } else {
          // If a[1] is negative, adjust `adjustedValueForCurrentIteration` to be positive.
          adjustedValueForCurrentIteration += (Math.abs(fullArr[idx + 1]) - 1);
          if (adjustedValueForCurrentIteration === 0) adjustedValueForCurrentIteration++;
          modificationsMadeThisIteration = adjustedValueForCurrentIteration;
        }
      }
    } else {
      // For subsequent elements (index > 0)
      if (previousIterationAdjustedSum > 0) {
        // If the previous adjusted sum was positive, the current adjusted sum must become negative.
        if (adjustedValueForCurrentIteration >= 0) {
          modificationsMadeThisIteration = (adjustedValueForCurrentIteration + 1);
          adjustedValueForCurrentIteration -= modificationsMadeThisIteration; // Forces it to -1
        }
      } else { // previousIterationAdjustedSum <= 0
        // If the previous adjusted sum was non-positive, the current adjusted sum must become positive.
        if (adjustedValueForCurrentIteration <= 0) {
          modificationsMadeThisIteration = (Math.abs(adjustedValueForCurrentIteration) + 1);
          adjustedValueForCurrentIteration += modificationsMadeThisIteration; // Forces it to 1
        }
      }
    }

    return {
      currentAdjustedSum: adjustedValueForCurrentIteration, // This becomes the `acc` for the next iteration, after adjustment
      totalModifications: totalModifications + modificationsMadeThisIteration
    };
  }, { currentAdjustedSum: 0, totalModifications: 0 }); // Initial state for the reducer

  console.log(finalAdjustmentResult.totalModifications);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
