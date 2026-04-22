const processInputAndCalculateRange = (inputContent) => {
  // Defensive programming: check for null, undefined, or empty input.
  if (!inputContent || typeof inputContent !== 'string' || inputContent.trim().length === 0) {
    return '-1'; // Indicate an error for invalid input.
  }

  // Split the raw input string into individual lines.
  // The first line should contain the segment count, the second line the divisors.
  const allInputLines = inputContent.trim().split('\n');

  // Validate the number of input lines. We expect at least two.
  if (allInputLines.length < 2) {
    return '-1'; // Insufficient data to proceed.
  }

  // Helper function to convert a space-separated string of numbers into an array of integers.
  const parseLineOfNumbers = (lineStr) => {
    return lineStr.split(' ').map(numericString => {
      const parsedNumber = Number.parseInt(numericString, 10);
      // Ensure all parsed values are valid numbers.
      if (Number.isNaN(parsedNumber)) {
        // If any value is not a number, the input is malformed.
        throw new Error('Non-numeric value detected in input.');
      }
      return parsedNumber;
    });
  };

  let segmentCountValue;
  let divisorValuesArray;

  try {
    // Parse the first line to get the total number of segments (corresponding to K).
    const firstLineNumbers = parseLineOfNumbers(allInputLines[0]);
    if (firstLineNumbers.length === 0) {
      throw new Error('First line, expected segment count, is empty.');
    }
    segmentCountValue = firstLineNumbers[0];

    // Parse the second line to get the array of divisor values (corresponding to A).
    divisorValuesArray = parseLineOfNumbers(allInputLines[1]);

    // Additional validation: The number of divisors should match the declared segment count.
    // The original problem implies `divisorsArray.length` should be `segmentCountValue`.
    if (divisorValuesArray.length !== segmentCountValue) {
        // This mismatch could lead to out-of-bounds access or incorrect logic.
        // For Type III, we make this explicit.
        if (divisorValuesArray.length < segmentCountValue) {
            throw new Error('Insufficient divisors provided for the declared segment count.');
        }
        // If more divisors are given, we might proceed, but for strictness, let's error.
        throw new Error('Mismatch between declared segment count and actual number of divisors.');
    }

    // Ensure segment count is positive and the divisor array is not empty.
    if (segmentCountValue <= 0 || divisorValuesArray.length === 0) {
      throw new Error('Segment count must be positive and divisor array cannot be empty.');
    }

  } catch (parsingError) {
    // Catch any parsing errors and return a general error indicator.
    return '-1';
  }

  // Initialize the range bounds. These typically start at [2, 2] for this class of problem.
  let currentRangeLowerBound = 2;
  let currentRangeUpperBound = 2;

  // Utility function to find the smallest multiple of a divisor that is greater than or equal to a value.
  const calculateCeilingMultiple = (valueToAdjust, targetDivisor) => {
    if (targetDivisor <= 0) {
      throw new Error('Divisor must be a positive number for ceiling multiple calculation.');
    }
    return Math.ceil(valueToAdjust / targetDivisor) * targetDivisor;
  };

  // Iterate backwards through the divisor array, starting from the second-to-last element.
  // The loop runs from `K-2` down to `0`.
  for (let segmentIndex = segmentCountValue - 2; segmentIndex >= 0; segmentIndex--) {
    const currentDivisorElement = divisorValuesArray[segmentIndex];     // Corresponds to A[i]
    const nextDivisorElement = divisorValuesArray[segmentIndex + 1]; // Corresponds to A[i+1]

    // Validate that divisors are positive, as division by zero or negative values would break logic.
    if (currentDivisorElement <= 0 || nextDivisorElement <= 0) {
      return '-1'; // Invalid divisor detected.
    }

    // Check for an impossible scenario early.
    // If the adjusted upper bound (based on the next segment) falls below the current segment's divisor,
    // then no valid range exists.
    const tempMaxAdjustedByNext = currentRangeUpperBound + nextDivisorElement - 1;
    if (tempMaxAdjustedByNext < currentDivisorElement) {
      return '-1';
    }

    // Update the lower bound: it must be a multiple of the current divisor and at least the current lower bound.
    currentRangeLowerBound = calculateCeilingMultiple(currentRangeLowerBound, currentDivisorElement);

    // First step of upper bound adjustment: align with the properties of the next divisor.
    // This finds the upper limit of the range `[k*nextDivisorElement, (k+1)*nextDivisorElement - 1]`
    // that starts at or after the current `currentRangeUpperBound`.
    let intermediateUpperBound = calculateCeilingMultiple(currentRangeUpperBound, nextDivisorElement) + nextDivisorElement - 1;

    // Second step of upper bound adjustment: ensure it is also aligned with the current divisor.
    // This effectively makes `intermediateUpperBound` the largest multiple of `currentDivisorElement`
    // that is less than or equal to `intermediateUpperBound`.
    let finalUpperBoundForThisIteration = intermediateUpperBound - (intermediateUpperBound % currentDivisorElement);

    // Critical check: after adjustments, if the upper bound becomes less than the lower bound,
    // this signifies an impossible range. This is a robust guard clause.
    if (finalUpperBoundForThisIteration < currentRangeLowerBound) {
      return '-1';
    }

    // Update the bounds for the next iteration.
    currentRangeUpperBound = finalUpperBoundForThisIteration;
  }

  // After the loop, calculate the final adjusted upper bound using the first divisor element (A[0]).
  const finalAdjustedResultUpperBound = currentRangeUpperBound + divisorValuesArray[0] - 1;

  // Final validation: Ensure the computed lower bound does not exceed the upper bound.
  if (currentRangeLowerBound > finalAdjustedResultUpperBound) {
    return '-1'; // The final range is inverted, indicating an error.
  }

  // Return the final lower and upper bounds as a space-separated string.
  return `${currentRangeLowerBound} ${finalAdjustedResultUpperBound}`;
};

// Main execution block: reads input, processes it, and prints the result.
(() => {
  try {
    // Utilize Node.js file system module to read from standard input.
    const fileSystemModule = require('fs');
    const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

    // Call the primary processing function.
    const computedResult = processInputAndCalculateRange(rawInputData);

    // Output the final result to standard output.
    console.log(computedResult);

  } catch (runtimeError) {
    // Catch any unexpected runtime errors (e.g., file system issues).
    // Output -1 as a general error indicator for such cases.
    console.log('-1');
  }
})();