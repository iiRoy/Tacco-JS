// This JavaScript module is designed to process incoming data, specifically focusing on a sequence of numbers
// provided on the second line of a multi-line input. Its primary goal is to determine if, after sorting,
// any two adjacent numbers in that sequence are identical, indicating the presence of duplicates.

/**
 * Orchestrates the parsing, processing, and output of the number sequence.
 * It reads a raw string input, extracts numeric data, sorts it, and then
 * checks for any repeated adjacent values.
 *
 * @param {string} rawInputData - The complete input string, potentially containing multiple lines.
 *                                  The relevant numbers are expected on the second line.
 */
function evaluateNumberSequence(rawInputData) {
  // --- Stage 1: Input Validation and Initial Parsing ---

  // Defensive check: Ensure the provided input is a non-empty string.
  // This is a Type III addition for robustness.
  if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
    console.error("Error: Input data is either invalid or empty. Cannot proceed with processing.");
    // In a real application, one might throw an error or return a specific status.
    return;
  }

  // Split the entire input string into an array of individual lines.
  // `.trim()` is used first to handle any leading/trailing whitespace for the whole input.
  const inputLines = rawInputData.trim().split('\n');

  // Defensive check: Verify that at least two lines are present in the input,
  // as the problem specification implies we need the second line.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines, but received fewer.");
    return;
  }

  // --- Stage 2: Numeric Data Extraction and Preparation ---

  // Access the second line of the input (at index 1) and split it by spaces.
  // This yields an array where each element is a string representation of a number.
  const stringNumericTokens = inputLines[1].split(' ');

  // Convert the array of string tokens into an array of actual numeric values.
  // The `Number` constructor is used as a mapping function, which handles conversion
  // (e.g., "123" -> 123, "abc" -> NaN).
  const parsedNumericValues = stringNumericTokens.map(Number);

  // Define a comparison function for numeric sorting.
  // JavaScript's default `sort()` treats elements as strings, so `(a, b) => a - b`
  // is crucial for correct ascending numeric order. This is a Type II update.
  const compareNumericalValues = (firstVal, secondVal) => firstVal - secondVal;

  // Sort the array of numbers using our custom numeric comparison function.
  // This step ensures that any potential duplicates will be placed next to each other.
  const orderedNumericSequence = parsedNumericValues.sort(compareNumericalValues);

  // --- Stage 3: Duplicate Detection Logic ---

  // Initialize a boolean flag to track whether any identical adjacent elements are found.
  let hasIdenticalAdjacentElements = false;

  // Iterate through the sorted sequence. We only need to go up to the second-to-last element
  // because we are comparing each element with its immediate successor.
  // The loop variable `idx` is a Type II rename from `i`.
  for (let idx = 0; idx < orderedNumericSequence.length - 1; idx++) {
    // Check if the current element is strictly equal to the next element in the sequence.
    if (orderedNumericSequence[idx] === orderedNumericSequence[idx + 1]) {
      hasIdenticalAdjacentElements = true; // A duplicate pair has been found.
      // Optimization: Once a duplicate is found, there's no need to continue iterating.
      // This `break` statement is a Type III addition for efficiency.
      break;
    }
  }

  // --- Stage 4: Output Result ---

  // Based on the `hasIdenticalAdjacentElements` flag, print the appropriate message.
  // Using a ternary operator for a concise conditional output statement.
  console.log(hasIdenticalAdjacentElements ? "NO" : "YES");
}

// The following line is the execution entry point for the script.
// It reads the entire content from standard input (`/dev/stdin`),
// decodes it as UTF-8, removes any leading/trailing whitespace,
// and then passes this processed string to our main function.
evaluateNumberSequence(require("fs").readFileSync("/dev/stdin", "utf8").trim());