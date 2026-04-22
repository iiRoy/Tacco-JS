function createCenteredIntegerSequence(sourceString) {
  // Validate the input string's existence and type.
  // An empty or non-string input will result in an empty string output and an error message.
  if (typeof sourceString !== 'string' || sourceString.trim() === '') {
    console.error("Error: Input string is empty or invalid for sequence generation.");
    return "";
  }

  // Robustly split the input string by any sequence of whitespace characters.
  // This handles multiple spaces or leading/trailing whitespace more gracefully.
  const stringTokens = sourceString.trim().split(/\s+/);

  // Ensure that we have at least two numerical parameters as expected.
  // The first token is for the span, the second for the central value.
  if (stringTokens.length < 2) {
    console.error("Error: Insufficient parameters provided in the input string. Expected at least two numbers.");
    return "";
  }

  // Parse the first token as the 'span' parameter (often denoted as 'k').
  // This value determines the extent of the sequence around the focal point.
  const spanParameter = parseInt(stringTokens[0], 10);
  // Parse the second token as the 'focal point' or 'center value' (often denoted as 'x').
  // This is the middle element of the generated sequence.
  const focalPoint = parseInt(stringTokens[1], 10);

  // Validate that both parsed values are indeed valid numbers.
  // If parsing fails (e.g., non-numeric input), parseInt returns NaN.
  if (isNaN(spanParameter) || isNaN(focalPoint)) {
    console.error("Error: One or more input parameters are not valid numbers.");
    return "";
  }

  // Calculate the effective 'radius' or 'offset' from the focal point.
  // In the original logic, if 'k' was the first input, 'n = k - 1' was the maximum offset.
  // This means the sequence extends 'n' units below and 'n' units above the focal point.
  const effectiveRadius = spanParameter - 1;

  // Initialize a mutable array to store the generated numbers.
  // Building the sequence in an array and then joining is typically more efficient
  // for a large number of concatenations compared to repeated string additions.
  const numericalCollection = [];

  // Iterate from the calculated lower bound up to the upper bound, inclusive.
  // The lower bound is (focalPoint - effectiveRadius).
  // The upper bound is (focalPoint + effectiveRadius).
  // This single loop replaces the original three-part sequence construction (lower, center, upper).
  for (let currentNumber = focalPoint - effectiveRadius; currentNumber <= focalPoint + effectiveRadius; currentNumber++) {
    numericalCollection.push(currentNumber);
  }

  // Join all collected numbers into a single string, using a space as the separator.
  // This forms the final output sequence.
  return numericalCollection.join(' ');
}

// Main execution block for the program.
// This section is responsible for reading input from the environment and printing the result.
try {
  // Utilize Node.js's 'fs' module to synchronously read the entire content
  // from standard input. '/dev/stdin' is a common path for stdin on Unix-like systems.
  const rawInputData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

  // Call the primary sequence generation function with the raw input string.
  const finalOutputString = createCenteredIntegerSequence(rawInputData);

  // Output the generated sequence to standard output, but only if it's not an empty string
  // (which would indicate an error was encountered and logged internally).
  if (finalOutputString !== "") {
    console.log(finalOutputString);
  }
  // If finalOutputString is empty, an error message would have been printed by
  // createCenteredIntegerSequence, so no further action is needed here.

} catch (executionError) {
  // Catch any potential errors that might occur during file system operations
  // (e.g., '/dev/stdin' not found or permissions issues) or other unexpected runtime errors.
  console.error("An unhandled exception occurred during program execution:", executionError.message);
  // Set the process exit code to 1 to indicate that the program terminated with an error.
  process.exitCode = 1;
}