/*
 * This module serves as a robust utility to process a specific input format
 * and compute a weighted score based on parsed numerical values.
 * It expects a single line of text containing two space-separated integers.
 * The scoring mechanism applies individual value-based points and a special
 * bonus under certain conditions.
 *
 * The primary goal is to demonstrate Type III code cloning, incorporating
 * structural changes, refactoring, additional validation, and enhanced error handling,
 * while preserving the original functional outcome.
 */
function computeWeightedScore(dataPayload) {
  // Define score constants for better readability and easier maintenance.
  // These represent the base points awarded for each specific numeric value.
  const POINTS_FOR_ONE = 300000;
  const POINTS_FOR_TWO = 200000;
  const POINTS_FOR_THREE = 100000;
  // This is an additional bonus applied when both input numbers are '1'.
  const BOTH_ONES_BONUS = 400000;

  // Initialize the aggregate score accumulator.
  let overallAccumulatedScore = 0;

  // --- Comprehensive Input Validation (Type III: adding guard clauses and checks) ---

  // Validate the initial data payload to ensure it's a non-empty string.
  if (typeof dataPayload !== 'string' || dataPayload === null || dataPayload.trim().length === 0) {
    console.error("Input processing failed: The provided data payload is invalid or empty.");
    return 0; // Return zero for invalid top-level input.
  }

  // Remove any leading/trailing whitespace and then split the string
  // into an array of substrings based on space as a delimiter.
  const inputSegments = dataPayload.trim().split(' ');

  // Ensure that we have exactly two segments as expected for two numbers.
  if (inputSegments.length !== 2) {
    console.error(`Input processing failed: Expected 2 numeric segments, but found ${inputSegments.length}.`);
    return 0; // Return zero if the input format doesn't match expectations.
  }

  // Parse the extracted string segments into integer numbers.
  // Using `Number()` constructor for conversion, which is an alternative to `parseInt()`.
  const primaryNumericalValue = Number(inputSegments[0]);
  const secondaryNumericalValue = Number(inputSegments[1]);

  // Validate that both parsed values are indeed finite numbers.
  if (!Number.isFinite(primaryNumericalValue) || !Number.isFinite(secondaryNumericalValue)) {
    console.error("Input processing failed: One or both segments could not be converted to valid numbers.");
    return 0;
  }

  // --- Helper Function for Component Scoring (Type III: adding new fragments/functions) ---

  /**
   * Determines the points awarded for a single numeric value based on predefined tiers.
   * Values outside the expected range (1, 2, 3) contribute zero points.
   * @param {number} individualValue The numeric value to score.
   * @returns {number} The points awarded for the given value.
   */
  const calculateIndividualPoints = (individualValue) => {
    switch (individualValue) {
      case 1:
        return POINTS_FOR_ONE;
      case 2:
        return POINTS_FOR_TWO;
      case 3:
        return POINTS_FOR_THREE;
      default:
        // For any other value, including numbers outside 1-3, or floats, contribute 0.
        // This also acts as an implicit validation for the range.
        console.warn(`Warning: Value ${individualValue} is outside the expected scoring range (1-3) and contributes 0 points.`);
        return 0;
    }
  };

  // --- Core Scoring Logic (Type III: rewriting and updating existing statements) ---

  // Add points for the primary numeric value.
  overallAccumulatedScore += calculateIndividualPoints(primaryNumericalValue);

  // Add points for the secondary numeric value.
  overallAccumulatedScore += calculateIndividualPoints(secondaryNumericalValue);

  // Determine if the special bonus condition is met.
  // (Type III: introducing a boolean helper variable for clarity)
  const isEligibleForBonus = (primaryNumericalValue === 1 && secondaryNumericalValue === 1);

  // If the bonus condition is true, add the additional points.
  if (isEligibleForBonus) {
    overallAccumulatedScore += BOTH_ONES_BONUS;
  }

  // --- Final Output ---

  // Display the total calculated score to the console.
  console.log(overallAccumulatedScore);
}

// --- Application Entry Point and Error Handling (Type III: adding try-catch, new variables) ---

// Define the standard input stream path as a constant.
const standardInputSourcePath = '/dev/stdin';

try {
  // Read the content from the standard input file synchronously.
  // Ensure the content is decoded as UTF-8.
  const rawDataFromStdin = require('fs').readFileSync(standardInputSourcePath, 'utf8');

  // Invoke the main score computation function with the acquired input.
  computeWeightedScore(rawDataFromStdin);
} catch (processingError) {
  // Catch and report any errors that occur during file reading or function execution.
  console.error(`An unhandled exception occurred during program execution: ${processingError.message}`);
  // Exit the process with a non-zero status code to indicate failure.
  process.exit(1);
}