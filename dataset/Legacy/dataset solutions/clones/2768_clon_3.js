((inputString) => {
  const MODULUS_CONSTANT = 2019;

  const allInputLines = inputString.split('\n');
  const firstLineSegments = allInputLines[0].split(' ');

  const lowerBoundary = parseInt(firstLineSegments[0], 10);
  const upperBoundary = parseInt(firstLineSegments[1], 10);

  const currentRangeLength = upperBoundary - lowerBoundary;

  // Evaluate conditions that lead to a guaranteed minimum remainder of 0.
  // Condition 1: The interval [lowerBoundary, upperBoundary] is wide enough to contain at least one multiple of MODULUS_CONSTANT.
  const isRangeSufficientlyLarge = currentRangeLength >= MODULUS_CONSTANT;

  // Condition 2: A multiple of MODULUS_CONSTANT exists within the interval (lowerBoundary, upperBoundary].
  // Calculate the smallest multiple of MODULUS_CONSTANT that is strictly greater than lowerBoundary.
  const firstMultipleAfterLower = lowerBoundary - (lowerBoundary % MODULUS_CONSTANT) + MODULUS_CONSTANT;
  const multipleIsWithinRange = firstMultipleAfterLower <= upperBoundary;

  if (isRangeSufficientlyLarge || multipleIsWithinRange) {
    console.log(0);
    return;
  }

  // Handle a specific edge case where the range consists of exactly two consecutive numbers (L, L+1).
  // The original code has a special output for this scenario.
  if (currentRangeLength === 1) {
    const specificCaseResult = lowerBoundary % MODULUS_CONSTANT;
    console.log(specificCaseResult);
    return;
  }

  let overallMinimumRemainder = Infinity;

  // Iterate through all valid pairs (i, k) as defined by the original loop structure.
  // Note: The original loops allow i >= k in some cases, which is preserved.
  for (let currentValI = lowerBoundary; currentValI <= upperBoundary - 1; currentValI++) {
    const remainderOfI = currentValI % MODULUS_CONSTANT;

    for (let currentValK = lowerBoundary + 1; currentValK <= upperBoundary; currentValK++) {
      const remainderOfK = currentValK % MODULUS_CONSTANT;

      const productIntermediate = remainderOfI * remainderOfK;
      const calculatedRemainder = productIntermediate % MODULUS_CONSTANT;

      // Update the minimum remainder found so far.
      if (calculatedRemainder < overallMinimumRemainder) {
        overallMinimumRemainder = calculatedRemainder;
      }
    }
  }

  console.log(overallMinimumRemainder);
})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);
