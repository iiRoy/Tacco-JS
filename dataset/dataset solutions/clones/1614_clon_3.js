const processInput = (rawData) => {
  const BILLION_FACTOR = 1000000000;
  const BILLION_SQUARED_FACTOR = BILLION_FACTOR * BILLION_FACTOR;

  let inputLines = rawData.split('\n');
  inputLines.shift(); // Discard the first line, typically N

  let matchingPairCount = 0;

  // Helper function to determine if a pair satisfies the condition
  const evaluatePairCondition = (valueA, valueB) => {
    // The original calculation: (args[i] * 10^9) * (args[j] * 10^9)
    // This is equivalent to (valueA * BILLION_FACTOR) * (valueB * BILLION_FACTOR)
    // We split the multiplication to introduce an intermediate step,
    // while preserving the exact floating-point behavior of the original.
    const termA = valueA * BILLION_FACTOR;
    const termB = valueB * BILLION_FACTOR;
    const combinedProduct = termA * termB;

    // The condition: result % (10^9 * 10^9) == 0
    return combinedProduct % BILLION_SQUARED_FACTOR === 0;
  };

  for (let indexA = 0; indexA < inputLines.length; indexA++) {
    // Explicitly convert string to number for clarity and consistency
    const numericValueA = Number(inputLines[indexA]);

    for (let indexB = indexA + 1; indexB < inputLines.length; indexB++) {
      const numericValueB = Number(inputLines[indexB]);

      if (evaluatePairCondition(numericValueA, numericValueB)) {
        matchingPairCount++;
      }
    }
  }
  console.log(matchingPairCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
