// This module is responsible for processing numerical input to determine optimal coverage.
// It reads two integer values from a string, representing a total quantity and a coverage radius, respectively.

/**
 * Calculates the minimum number of coverage units required for a given total quantity
 * and individual unit coverage radius.
 *
 * @param {string} inputString The raw input data as a string, e.g., "10 2".
 */
const calculateOptimalCoverage = (inputString) => {
  // Step 1: Parse the input string into its constituent numeric parts.
  // First, remove any leading/trailing whitespace, then split by one or more space characters.
  const dataSegments = inputString.trim().split(/\s+/);

  // Step 2: Validate the input format.
  // Ensure that exactly two numeric values were provided in the input string.
  if (dataSegments.length !== 2) {
    // Log an error message if the input format is incorrect and terminate processing.
    console.error("Input format error: Expected exactly two numeric values separated by space.");
    return;
  }

  // Step 3: Extract and convert the string parts into integer numbers.
  // The first part represents the total number of items or points to be covered.
  const totalItems = parseInt(dataSegments[0], 10);
  // The second part represents the radius of coverage for a single unit.
  const effectiveRadius = parseInt(dataSegments[1], 10);

  // Step 4: Perform extensive input validation for the parsed numbers.
  // Check if either of the parsed values resulted in NaN (Not a Number).
  if (isNaN(totalItems) || isNaN(effectiveRadius)) {
    console.error("Data parsing error: Both input values must be valid integers.");
    return;
  }
  // Ensure that the total number of items to cover is a positive integer.
  if (totalItems <= 0) {
    console.error("Validation failure: The total number of items must be a positive integer.");
    return;
  }
  // Ensure that the coverage radius is a non-negative integer.
  if (effectiveRadius < 0) {
    console.error("Validation failure: The coverage radius cannot be a negative value.");
    return;
  }

  // Step 5: Calculate the effective span of a single coverage unit.
  // A single unit covers itself (1 item) plus 'effectiveRadius' items on its left and 'effectiveRadius' items on its right.
  // Therefore, the total span is: effectiveRadius + 1 (for the unit itself) + effectiveRadius.
  const unitCoverageSpan = (effectiveRadius * 2) + 1;

  // Step 6: Validate the calculated unit coverage span to prevent division by zero or negative spans.
  // This is a critical check before performing the division.
  if (unitCoverageSpan <= 0) {
    console.error("Calculation constraint violation: The effective unit coverage span must be positive. Check the radius parameter.");
    return;
  }

  // Step 7: Perform the core calculation: determine the raw ratio of total items to unit span.
  // This gives a floating-point number representing how many units *would* be needed if partial units were allowed.
  const rawCoverageRatio = totalItems / unitCoverageSpan;

  // Step 8: Round up the raw ratio to the nearest whole number.
  // Since partial units are not practical, we always need to round up to ensure full coverage.
  const finalUnitsRequired = Math.ceil(rawCoverageRatio);

  // Step 9: Output the final computed result to the standard console.
  // The output is just the number, matching the original program's simple output format.
  console.log(finalUnitsRequired);
};

// --- Program Entry Point (Main Execution Block) ---
// This immediately-invoked function expression (IIFE) serves as the primary execution wrapper.
// It handles reading input from the system and delegating to the processing logic.
(function executeProgram() {
  try {
    // Attempt to read the entire content of standard input synchronously.
    // The input is expected to be UTF-8 encoded text.
    const fileContentBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Pass the retrieved file content (as a string) to our main calculation function.
    calculateOptimalCoverage(fileContentBuffer);
  } catch (operationError) {
    // If any error occurs during file reading (e.g., file not found, permission issues)
    // or within the processing logic that throws an error, catch it here.
    console.error("An unexpected error prevented the program from completing:", operationError.message);
    // For detailed debugging, the full error stack could be logged: console.error(operationError.stack);
  }
})();