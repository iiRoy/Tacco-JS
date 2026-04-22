console.log(((dataPayload) => {
  const lineSegments = dataPayload.trim().split('\n');
  const numericFactors = lineSegments[1].split(' ').map(Number);

  const determineNextCeilingMultiple = (valueOperand, divisorOperand) => {
    // Equivalent to Math.ceil(valueOperand / divisorOperand) * divisorOperand
    return (((valueOperand + divisorOperand - 1) / divisorOperand) | 0) * divisorOperand;
  };

  const determinePreviousFloorMultiple = (valueOperand, divisorOperand) => {
    // Equivalent to valueOperand - (valueOperand % divisorOperand)
    return ((valueOperand / divisorOperand) | 0) * divisorOperand;
  };

  // If the input sequence is empty or only has one element, handle base cases.
  // The problem structure implies at least one factor.
  // If numericFactors.length is 0, lines[1] was empty, map(Number) gives [0].
  // Assuming positive factors, so if [0], it's an error.
  // If K=1 (numericFactors.length=1), the loop in original code does not run.
  // It returns `2 ${2+A[0]-1}`.
  if (numericFactors.length === 0) {
      // This case would imply K=0. Original parsing would make numericFactors = [0].
      // For type IV, let's match the original's implicit behavior.
      // If K=0, A=[0], then A[0] is 0. Division by zero.
      // Assuming valid inputs where factors are positive.
      // If the input was literally "0\n", numericFactors would be [0].
      // The original code would set min=2, max=2, loop would not run, then output "2 2+0-1" -> "2 1".
      // This is a weird edge case for the problem statement.
      // Let's assume inputs always have at least one positive factor.
      // If numericFactors becomes [0] due to empty input line, it'll still work with 2 1.
      // But if actual A[0] is 0, it'll fail.
      // For Type IV, let's match the observed behavior for A.length=1.
      return `2 ${1 + numericFactors[0]}`;
  }


  // Create pairs of adjacent factors, processed in reverse order of the original loop.
  // The original loop iterates for `i` from `K-2` down to `0`, considering `A[i]` and `A[i+1]`.
  // This corresponds to pairs `(A[0], A[1]), (A[1], A[2]), ..., (A[K-2], A[K-1])`.
  const factorComponentPairs = Array.from({ length: numericFactors.length - 1 }, (_, k) => [
    numericFactors[k],
    numericFactors[k + 1]
  ]);

  try {
    // The initial range for `L` (lowerPoint) and `R` (upperPoint) is `[2, 2]`.
    // This is the base for the rightmost factor `A[K-1]`.
    const computedRange = factorComponentPairs.reduceRight((currentBounds, componentDivisors) => {
      const { lowerPoint, upperPoint } = currentBounds;
      const [firstFactor, secondFactor] = componentDivisors;

      // Original check: `if ( max + A[i+1] - 1 < A[i] ) return '-1';`
      // `upperPoint` is `max`, `secondFactor` is `A[i+1]`, `firstFactor` is `A[i]`.
      // This checks if the maximum possible `R` (derived from the previous step's upper bound)
      // is smaller than the current `firstFactor`. If so, no valid range exists.
      if (upperPoint + secondFactor - 1 < firstFactor) {
        throw new Error('IncompatibleInterval');
      }

      // Original: `min = Math.ceil(min/A[i])*A[i];`
      // `lowerPoint` is `min`, `firstFactor` is `A[i]`.
      let nextLowerPoint = determineNextCeilingMultiple(lowerPoint, firstFactor);

      // Original: `max = Math.ceil(max/A[i+1])*A[i+1] + A[i+1] - 1;`
      // `upperPoint` is `max`, `secondFactor` is `A[i+1]`.
      let temporaryUpperCandidate = determineNextCeilingMultiple(upperPoint, secondFactor) + secondFactor - 1;

      // Original: `max -= max % A[i];`
      // `temporaryUpperCandidate` is `max`, `firstFactor` is `A[i]`.
      let nextUpperPoint = determinePreviousFloorMultiple(temporaryUpperCandidate, firstFactor);

      // If the calculated lower bound exceeds the upper bound, no solution.
      if (nextLowerPoint > nextUpperPoint) {
        throw new Error('IncompatibleInterval');
      }

      return { lowerPoint: nextLowerPoint, upperPoint: nextUpperPoint };
    }, { lowerPoint: 2, upperPoint: 2 }); // Initial state for the rightmost factor A[K-1]

    // Final result formatting: `min` and `max+A[0]-1`
    const finalLowerBound = computedRange.lowerPoint;
    const finalUpperBound = computedRange.upperPoint + numericFactors[0] - 1;

    return `${finalLowerBound} ${finalUpperBound}`;

  } catch (e) {
    if (e.message === 'IncompatibleInterval') {
      return '-1';
    }
    // Re-throw any other unexpected errors
    throw e;
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')));