'use strict' // Enforce strict mode for cleaner, safer code execution.

/**
 * Processes a string of numerical input to determine how many multiples of a given divisor
 * exist within a specified numerical range (inclusive).
 *
 * This function applies Type III code clone transformations:
 * - Extensive renaming of identifiers (variables, functions).
 * - Changes in data parsing and validation (e.g., parseFloat, isNaN checks, guard clauses).
 * - Structural modifications to the core logic, including helper variables and loop refactoring.
 * - Addition of error handling and input validation.
 * - Rewritten comments for clarity and detail.
 *
 * @param {string} inputDataString - A string containing three space-separated numbers:
 *                                 [lowerBoundary, upperBoundary, frequencyDivisor].
 */
const processNumericalRange = (inputDataString) => {
  // Validate input string presence and trim any leading/trailing whitespace.
  if (!inputDataString || inputDataString.trim() === '') {
    console.error("Error: Empty or whitespace-only input string provided.");
    console.log(0); // Default output for invalid input.
    return;
  }

  // Parse the raw input string into an array of numerical components.
  // Using parseFloat for robustness, and explicit NaN handling.
  const numericalComponents = inputDataString.trim().split(/\s+/).map(segment => {
    const parsedValue = parseFloat(segment);
    // If a segment is not a valid number, treat it as zero to prevent errors.
    // A more strict implementation might throw an error or skip.
    return isNaN(parsedValue) ? 0 : parsedValue;
  });

  // --- Type III: Add validation for input parameters ---
  // Ensure exactly three numerical parameters were successfully extracted.
  if (numericalComponents.length < 3) {
    console.error(`Error: Insufficient input parameters. Expected 3 numbers, received ${numericalComponents.length}.`);
    console.log(0);
    return;
  }

  // Extract the range boundaries and the divisor value using descriptive names.
  // Applying Math.floor to ensure integer behavior for range and divisor,
  // as typically expected for modulo and counting problems.
  let lowerBoundary = Math.floor(numericalComponents[0]);
  let upperBoundary = Math.floor(numericalComponents[1]);
  let frequencyDivisor = Math.floor(numericalComponents[2]);

  // --- Type III: Add early exit guard clauses for invalid conditions ---
  // 1. Handle non-positive divisors to prevent infinite loops or nonsensical results.
  if (frequencyDivisor <= 0) {
    console.log(0); // A non-positive divisor cannot have positive multiples in a positive range.
    return;
  }

  // 2. Handle inverted or empty ranges.
  if (lowerBoundary > upperBoundary) {
    console.log(0); // If the starting point is greater than the ending point, the range is empty.
    return;
  }

  let totalOccurrences = 0; // Initialize a counter for the number of matching multiples found.

  // --- Type III: Refactor the core counting logic ---
  // The original nested loop with `i = j` side-effect is replaced by a two-phase approach:
  // Phase 1: Find the very first multiple of 'frequencyDivisor' that falls within the [lowerBoundary, upperBoundary] range.
  let currentScanPoint = lowerBoundary;
  let firstMultipleInScope = -1; // Sentinel value indicating no multiple found yet.

  // Iterate from the lower boundary upwards to locate the first qualifying multiple.
  // This loop replaces the initial search portion of the original outer loop.
  while (currentScanPoint <= upperBoundary) {
    if (currentScanPoint % frequencyDivisor === 0) {
      firstMultipleInScope = currentScanPoint; // Found the first one.
      break; // Exit this search loop.
    }
    currentScanPoint++; // Advance to the next integer.
  }

  // Phase 2: If a first multiple was found, count all subsequent multiples within the range.
  // This loop directly counts the multiples, replacing the original inner loop's function.
  if (firstMultipleInScope !== -1) {
    // Start counting from the first multiple found, incrementing by the divisor.
    for (let currentMultipleCandidate = firstMultipleInScope; currentMultipleCandidate <= upperBoundary; currentMultipleCandidate += frequencyDivisor) {
      totalOccurrences++; // Increment the count for each valid multiple.
    }
  }

  // Output the final calculated count of occurrences.
  console.log(totalOccurrences);
};

// --- Type III: Modify the input reading mechanism and add error handling ---
// Encapsulate the input reading logic within an immediately invoked function expression (IIFE)
// for better scope management and error handling.
(() => {
  const fileSystemUtility = require("fs"); // Import the Node.js file system module.
  const standardInputDevicePath = "/dev/stdin"; // Define the standard input file path.

  try {
    // Read the content of the standard input file synchronously, using UTF-8 encoding.
    const rawInputContent = fileSystemUtility.readFileSync(standardInputDevicePath, "utf8");
    // Pass the cleaned input content to our processing function.
    processNumericalRange(rawInputContent.trim());
  } catch (fileReadError) {
    // Log an error if file reading fails (e.g., file not found, permissions issue).
    console.error(`Application Error: Could not read input from '${standardInputDevicePath}'.`, fileReadError.message);
    // In a production scenario, one might log to an external system or exit with a specific code.
  }
})();