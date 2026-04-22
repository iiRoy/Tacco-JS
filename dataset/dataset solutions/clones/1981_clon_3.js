process.stdin.setEncoding('utf-8'); // Ensure standard input stream uses UTF-8 character encoding.

// Define constants for the specific divisor values to improve clarity and future maintainability.
const FIRST_EXCLUSION_MODULO = 3;
const SECOND_EXCLUSION_MODULO = 5;

// Register an asynchronous event handler for incoming data on the standard input stream.
process.stdin.on('data', function (incomingPayload) {
  // Convert the input buffer/string to a trimmed string representation.
  const rawDataSegment = String(incomingPayload).trim();

  // Attempt to parse the cleaned input string into an integer.
  // Using radix 10 is crucial for consistent integer parsing.
  const numericUpperBoundary = parseInt(rawDataSegment, 10);

  // --- Input Validation (Guard Clause) ---
  // Verify that the parsed input is indeed a valid, positive integer.
  if (isNaN(numericUpperBoundary) || numericUpperBoundary < 1) {
    // If the input is invalid, log an error message to standard error.
    console.error("Input processing error: Expected a positive integer. Received:", rawDataSegment);
    // Terminate the current data processing to prevent further errors.
    return;
  }

  // Initialize a variable to accumulate the sum of qualifying numbers.
  let cumulativeSum = 0;

  // Begin an iterative process from the first positive integer up to the determined boundary, inclusively.
  for (let currentIterationValue = 1; currentIterationValue <= numericUpperBoundary; currentIterationValue++) {
    // --- Intermediate Calculation Steps ---
    // Evaluate if the current number is perfectly divisible by the first exclusion factor.
    const isDivisibleByFirstCriterion = (currentIterationValue % FIRST_EXCLUSION_MODULO === 0);
    // Evaluate if the current number is perfectly divisible by the second exclusion factor.
    const isDivisibleBySecondCriterion = (currentIterationValue % SECOND_EXCLUSION_MODULO === 0);

    // --- Conditional Addition Logic ---
    // Only add the current number to the cumulative sum if it satisfies BOTH non-divisibility conditions.
    // This means it must not be divisible by the first factor AND not be divisible by the second factor.
    if (!isDivisibleByFirstCriterion && !isDivisibleBySecondCriterion) {
      // Increment the running total with the current qualifying number.
      cumulativeSum += currentIterationValue;
    }
  }

  // Output the final computed sum to the standard output.
  console.log(cumulativeSum);
});

// Optional: Add a general error handler for the stdin stream to catch unexpected issues.
process.stdin.on('error', (inputError) => {
  console.error('An unexpected error occurred during standard input operation:', inputError.message);
});