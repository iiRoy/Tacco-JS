/**
 * @file This script processes a sequence of numerical inputs to calculate a minimum cost using dynamic programming.
 * It's a Type III clone, meaning it includes extensive structural and stylistic modifications
 * while preserving the core algorithmic functionality.
 *
 * Changes include:
 * - Renaming all identifiers for obscurity.
 * - Reformatting whitespace and code structure.
 * - Adding helper functions for common operations (parsing, cost calculation, min finding, output).
 * - Implementing guard clauses and input validation for robustness.
 * - Modifying array initialization and population methods.
 * - Rewriting conditional logic and arithmetic expressions in equivalent but different ways.
 * - Introducing intermediate variables and constants for clarity and to break down complex lines.
 * - Encapsulating file I/O in a separate initialization block with error handling.
 */

/**
 * Outputs a computed numerical result to the standard console.
 * This function serves as a wrapper for `console.log` for potential future modification
 * or to abstract the output mechanism.
 *
 * @param {number} finalNumericalOutcome - The numerical value to be displayed.
 */
function transmitResult(finalNumericalOutcome) {
  console.log(finalNumericalOutcome);
}

/**
 * Safely parses a string into an integer. Includes basic validation.
 * If the parsing fails, it defaults to 0 to prevent NaN propagation,
 * or could be enhanced to throw specific errors.
 *
 * @param {string} textValue - The string representation of an integer.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
function extractIntegerFromText(textValue) {
  const processedValue = parseInt(textValue, 10);
  // If parsing results in NaN, treat as zero to maintain numerical operations.
  // A more robust application might throw an error or handle this case differently.
  return isNaN(processedValue) ? 0 : processedValue;
}

/**
 * Calculates a specific cost component based on the parity of a number,
 * with a special rule for zero.
 * Original logic: 0 -> 2, even non-zero -> 0, odd -> 1.
 * This implementation uses a slightly more verbose conditional structure.
 *
 * @param {number} currentNumericalValue - The number whose even component cost is to be determined.
 * @returns {number} The calculated even component cost.
 */
function deriveEvenComponentCost(currentNumericalValue) {
  if (currentNumericalValue === 0) {
    return 2; // Special case: zero has a cost of 2.
  } else if (currentNumericalValue % 2 === 0) {
    return 0; // Even non-zero numbers have a cost of 0.
  } else {
    return 1; // Odd numbers have a cost of 1.
  }
}

/**
 * Calculates another specific cost component based on the parity of a number.
 * Original logic: even -> 1, odd -> 0.
 * This implementation uses a bitwise XOR operation for a compact rewrite.
 *
 * @param {number} currentNumericalValue - The number whose odd component cost is to be determined.
 * @returns {number} The calculated odd component cost.
 */
function deriveOddComponentCost(currentNumericalValue) {
  // Using bitwise XOR with 1 to flip the least significant bit:
  // 0 (even) becomes 1, 1 (odd) becomes 0.
  return (currentNumericalValue & 1) ^ 1;
}

/**
 * Finds the minimum value within a specified prefix of an array.
 * This helper is introduced to refactor repetitive `Math.min` calls over array slices.
 *
 * @param {number[]} sourceArray - The array to search within.
 * @param {number} numberOfElements - The number of elements from the beginning of the array to consider.
 * @returns {number} The minimum value found, or Infinity if the subset is empty or invalid.
 */
function locateMinimumInPrefix(sourceArray, numberOfElements) {
  let minFound = Infinity; // Initialize with a very large value.

  // Defensive checks for array validity and count.
  if (!Array.isArray(sourceArray) || numberOfElements <= 0) {
    return minFound;
  }

  // Ensure we don't try to access elements beyond the array's bounds.
  const effectiveCount = Math.min(numberOfElements, sourceArray.length);

  // Iterate through the specified prefix to find the minimum.
  for (let k = 0; k < effectiveCount; ++k) {
    minFound = Math.min(minFound, sourceArray[k]);
  }
  return minFound;
}

/**
 * The primary function responsible for processing the raw input data.
 * It implements a dynamic programming approach to solve a cost minimization problem.
 *
 * @param {string} rawInputContent - The entire input string, typically read from stdin.
 */
function processApplicationData(rawInputContent) {
  // --- Input Validation and Pre-processing ---
  // Guard clause: Check for empty or invalid input string.
  if (!rawInputContent || rawInputContent.trim().length === 0) {
    transmitResult(0); // Default result for no input.
    return;
  }

  const separatedLines = rawInputContent.split("\n");

  // Guard clause: Ensure there's at least one line for sequence length.
  if (separatedLines.length === 0) {
    transmitResult(0);
    return;
  }

  // Extract the length of the sequence from the first line.
  const dataSequenceLength = extractIntegerFromText(separatedLines[0]);

  // Guard clause: Handle non-positive sequence lengths.
  if (dataSequenceLength <= 0) {
    transmitResult(0);
    return;
  }

  // Populate the array of numerical elements.
  const numericalElementList = [];
  // Loop from the second line onwards, up to the declared sequence length.
  for (let currentLineIndex = 0; currentLineIndex < dataSequenceLength; ++currentLineIndex) {
    // Add 1 to currentLineIndex to skip the first line (sequence length).
    const elementValue = extractIntegerFromText(separatedLines[currentLineIndex + 1]);
    numericalElementList.push(elementValue);
  }

  // --- Dynamic Programming Table Initialization ---
  const STATE_COUNT = 5; // Constant for the number of DP states.

  // Initialize the 2D DP table (cost matrix) with Infinity.
  // The table size is (dataSequenceLength + 1) rows by STATE_COUNT columns.
  const minimumCostTable = Array.from({ length: dataSequenceLength + 1 }, () =>
    Array(STATE_COUNT).fill(Infinity)
  );

  // Set the base case for the DP table (first row).
  // All states at index 0 (representing an empty prefix) have a cost of 0.
  minimumCostTable[0].fill(0);

  // --- Dynamic Programming Calculation Loop ---
  // Iterate through each element of the numerical sequence.
  for (let sequencePosition = 1; sequencePosition <= dataSequenceLength; ++sequencePosition) {
    // Retrieve the current element's value.
    const activeElementValue = numericalElementList[sequencePosition - 1];

    // Calculate specific cost components for the current element using helper functions.
    const specificEvenCost = deriveEvenComponentCost(activeElementValue);
    const specificOddCost = deriveOddComponentCost(activeElementValue);
    const directElementContribution = activeElementValue; // Direct value as a cost.

    // Access the costs from the previous row for calculations.
    const previousRowCosts = minimumCostTable[sequencePosition - 1];

    // Update costs for the current sequence position across all states.

    // State 0: Accumulates direct element contribution.
    minimumCostTable[sequencePosition][0] = previousRowCosts[0] + directElementContribution;

    // State 1: Minimum of previous State 0 or 1, plus even cost.
    minimumCostTable[sequencePosition][1] = locateMinimumInPrefix(previousRowCosts, 2) + specificEvenCost;

    // State 2: Minimum of previous States 0, 1, or 2, plus odd cost.
    minimumCostTable[sequencePosition][2] = locateMinimumInPrefix(previousRowCosts, 3) + specificOddCost;

    // State 3: Minimum of previous States 0, 1, 2, or 3, plus even cost.
    minimumCostTable[sequencePosition][3] = locateMinimumInPrefix(previousRowCosts, 4) + specificEvenCost;

    // State 4: Minimum of previous States 0, 1, 2, 3, or 4, plus direct element contribution.
    minimumCostTable[sequencePosition][4] = locateMinimumInPrefix(previousRowCosts, 5) + directElementContribution;
  }

  // --- Final Result Extraction ---
  // The final answer is the minimum value in the last row of the DP table.
  const ultimateMinimumCost = Math.min(...minimumCostTable[dataSequenceLength]);

  // Output the final computed minimum cost using the dedicated output function.
  transmitResult(ultimateMinimumCost);
}

/**
 * Self-executing anonymous function to initialize the application.
 * This handles reading the input file and calling the main processing logic.
 * Includes basic error handling for file operations.
 */
(function initializeApplicationExecution() {
  try {
    // Dynamically require the file system module.
    const fileSystemHandler = require("fs");
    // Read the input from standard input, specified as UTF-8.
    const incomingPayload = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
    // Pass the raw input content to the main processing function.
    processApplicationData(incomingPayload);
  } catch (operationError) {
    // Log any errors encountered during file reading or processing.
    console.error("An operational error occurred during execution:", operationError.message);
    // Transmit a sentinel value (-1) to indicate an error state to the user.
    transmitResult(-1);
  }
})();