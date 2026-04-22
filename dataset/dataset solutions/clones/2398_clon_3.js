const analyzeNumericSequence = (sourceInputString) => {
  // A utility function to safely convert a string to an integer,
  // returning NaN if parsing fails.
  const parseNumericValue = (valueText, fallback = NaN) => {
    const numericResult = parseInt(valueText, 10);
    return isNaN(numericResult) ? fallback : numericResult;
  };

  // Divide the complete raw input string into distinct lines.
  const dataLines = sourceInputString.trim().split('\n');

  // Implement a guard clause for insufficient input.
  if (dataLines.length < 2) {
    console.error("Error: Input data is incomplete. Expected at least two lines.");
    return;
  }

  // Process the first line to extract configuration parameters:
  // total number of elements and the modulus divisor.
  const configurationTokens = dataLines[0].split(/\s+/); // Use regex for robust whitespace splitting.
  const totalElements = parseNumericValue(configurationTokens[0]);
  const modulusDivisor = parseNumericValue(configurationTokens[1]);

  // Validate the extracted configuration values.
  if (isNaN(totalElements) || totalElements <= 0) {
    console.error("Error: The specified total number of elements (N) is invalid or non-positive.");
    return;
  }
  if (isNaN(modulusDivisor) || modulusDivisor <= 0) {
    console.error("Error: The specified modulus divisor (K) is invalid or non-positive.");
    return;
  }

  // Convert the second line of the input into an array of numbers.
  // The `Number` constructor can be used directly with `map` for type coercion.
  const numericalDataPoints = dataLines[1].split(/\s+/).map(Number);

  // Perform a validation check: ensure the actual number of data points
  // matches the declared totalElements from the configuration.
  if (numericalDataPoints.length !== totalElements) {
    console.warn(`Warning: Declared element count (${totalElements}) differs from actual data points (${numericalDataPoints.length}). Using actual count for processing.`);
    // For this implementation, we will proceed using the actual length of the data array.
  }
  const effectiveElementCount = numericalDataPoints.length;

  let qualifyingSubsequenceCount = 0; // This accumulator stores the final result.

  // The outer loop iterates through every possible starting position for a subsequence.
  for (let startPosition = 0; startPosition < effectiveElementCount; ++startPosition) {
    let currentSubsequenceSum = 0; // Initialize sum for subsequences starting at `startPosition`.

    // The inner loop extends the subsequence, starting with length 1,
    // and incrementally adding elements. `subsequenceLength` tracks the current length.
    for (let subsequenceLength = 1; startPosition + subsequenceLength <= effectiveElementCount; ++subsequenceLength) {
      // Add the next element in the sequence to the running sum.
      // The element to add is at index `startPosition + subsequenceLength - 1`.
      currentSubsequenceSum += numericalDataPoints[startPosition + subsequenceLength - 1];

      // Check the core condition: if the sum of the current subsequence,
      // when divided by the modulus, yields a remainder equal to the subsequence's length.
      if ((currentSubsequenceSum % modulusDivisor) === subsequenceLength) {
        qualifyingSubsequenceCount++; // Increment the counter if the condition is met.
      }
    }
  }

  // Print the final calculated count of qualifying subsequences.
  console.log(qualifyingSubsequenceCount);
};

// Standard input handling: read the entire content of stdin.
// This part of the code acts as the entry point for execution in a typical environment.
const stdinContent = require('fs').readFileSync('/dev/stdin', 'utf8');
analyzeNumericSequence(stdinContent);