/*
 * This JavaScript module is designed to process a string of numeric characters
 * and determine if the sum of its individual digits is perfectly divisible by nine.
 *
 * The core principle leveraged here is a common mathematical property:
 * a number is divisible by 9 if and only if the sum of its digits is divisible by 9.
 * This implementation applies this rule to a string representation of digits.
 *
 * Changes from original:
 * - Extensive identifier renaming for clarity and to avoid direct mapping.
 * - Restructured input parsing by chaining methods and removing intermediate variables.
 * - Switched `parseInt` to `Number` for digit conversion.
 * - Added a filter step to explicitly handle and remove non-numeric characters,
 *   enhancing robustness for potentially mixed input.
 * - Introduced a guard clause to validate the input string's type and content.
 * - Used an explicit initial value for the `reduce` accumulator.
 * - Replaced the ternary operator with an `if-else` block for output logic.
 * - Encapsulated file system operations within a `try-catch` block for error handling.
 * - Introduced helper constants for magic numbers (like the divisor 9).
 * - Comprehensive comments added to explain the logic and design choices.
 */
function ProcessNumericString(sourceData) {
  // Validate the incoming data to ensure it's a non-empty string.
  // This is a new guard clause to prevent unexpected behavior with invalid inputs.
  if (typeof sourceData !== 'string' || sourceData.trim().length === 0) {
    console.error("Input Error: Data for processing must be a non-empty string.");
    return; // Terminate execution gracefully for invalid input.
  }

  // Define the constant factor used for the divisibility check.
  // This replaces the magic number '9' with a descriptive constant.
  const DIVISIBILITY_FACTOR = 9;

  // Transform the input string:
  // 1. Split it into an array of individual character strings.
  // 2. Map each character string to its numerical equivalent.
  // 3. Filter out any results that are Not-a-Number (NaN), ensuring only valid digits proceed.
  const numericalComponents = sourceData
    .split('') // Splits the string into an array of characters.
    .map(singleDigitChar => Number(singleDigitChar)) // Converts each character to a number.
    .filter(val => !isNaN(val)); // Removes any entries that failed conversion (e.g., non-digits).

  // If, after filtering, no valid numbers remain but the original string wasn't empty,
  // it implies the input contained no usable digits.
  if (numericalComponents.length === 0 && sourceData.length > 0) {
    console.log("No"); // Consistent with original behavior if sum is NaN/0 for empty valid list.
    return;
  }

  // Compute the total sum of all valid numerical components.
  // The `reduce` method is used with an explicit initial value of 0 for robustness.
  let accumulatedTotal = numericalComponents.reduce(
    (currentAccumulator, nextNumericValue) => currentAccumulator + nextNumericValue,
    0 // Explicitly start the sum from zero.
  );

  // Evaluate if the calculated total sum is perfectly divisible by the defined factor.
  // The output logic is now handled by a clear if-else block.
  if (accumulatedTotal % DIVISIBILITY_FACTOR === 0) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

// --- Application Entry Point ---
// This section handles reading the input from the standard input stream,
// mimicking a typical environment for competitive programming challenges.
const fileSystemHandler = require("fs");
const standardInputEndpoint = "/dev/stdin"; // Path to standard input.

try {
  // Read the content from standard input synchronously, decoded as UTF-8.
  const rawDataFromSource = fileSystemHandler.readFileSync(standardInputEndpoint, "utf8");

  // Pass the obtained data to our primary processing function.
  ProcessNumericString(rawDataFromSource);
} catch (ioError) {
  // Catch and report any errors that occur during file reading.
  console.error(`Critical Error: Unable to read from standard input. Details: ${ioError.message}`);
  // As a fallback or for consistency, process an empty string in case of input failure.
  ProcessNumericString("");
}