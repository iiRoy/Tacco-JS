// This module is designed to process a single line of numeric input.
// It calculates how many integers, within a specified range, possess an odd number of digits.
function analyzeNumericSequence(inputStringPayload) {
  // Step 1: Input Validation and Parsing
  // Ensure the provided payload is indeed a string. If not, log an error and exit gracefully.
  if (typeof inputStringPayload !== 'string') {
    console.error("ERROR: The provided input payload must be a string type. Cannot proceed.");
    // In a production scenario, one might throw an exception here.
    return 0;
  }

  // Remove any leading/trailing whitespace from the input string to prevent parsing issues.
  const cleanedInput = inputStringPayload.trim();

  // Convert the cleaned input string into an integer. This integer defines the upper bound
  // (exclusive) for our counting process.
  const sequenceBoundary = parseInt(cleanedInput, 10);

  // Validate the parsed numeric boundary. It must be a valid, positive integer.
  // If not, log a warning and return zero, indicating no valid sequence to process.
  if (isNaN(sequenceBoundary) || sequenceBoundary <= 0) {
    console.warn(`WARNING: Invalid or non-positive sequence boundary detected: '${cleanedInput}'. No numbers will be counted.`);
    return 0;
  }

  // Step 2: Core Logic - Counting Numbers with Odd Digit Lengths
  // Initialize a counter to keep track of numbers that meet our criteria.
  let qualifyingNumberCount = 0;

  // Define a utility function to check if a given number has an odd count of digits.
  // This promotes modularity and readability.
  const checkOddDigitCount = (valueToExamine) => {
    // Convert the number to its string representation to easily determine its length.
    const stringRepresentation = String(valueToExamine);
    // The length of the string determines the number of digits.
    // We check if this length is an odd number.
    return (stringRepresentation.length % 2 !== 0);
  };

  // Iterate through all positive integers starting from one, up to, but not including,
  // the `sequenceBoundary` value.
  // Using 'let' for block-scoped iteration variable and a pre-increment operator.
  for (let currentIterationValue = 1; currentIterationValue < sequenceBoundary; ++currentIterationValue) {
    // For each number in the sequence, apply our digit count check.
    if (checkOddDigitCount(currentIterationValue)) {
      // If the current number has an odd number of digits, increment our main counter.
      qualifyingNumberCount = qualifyingNumberCount + 1;
    }
  }

  // Step 3: Output the Result
  // Display the final accumulated count to the console, which is typically standard output.
  console.log(qualifyingNumberCount);
}

// This section is responsible for reading input from the standard input stream
// and invoking the main processing function. It should generally remain untouched
// to ensure proper execution within typical competitive programming environments.
analyzeNumericSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());