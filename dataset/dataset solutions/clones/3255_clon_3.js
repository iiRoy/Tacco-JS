'use strict';

/**
 * @file This script implements a Collatz sequence cycle detection algorithm.
 *       It reads a numerical input from standard input, calculates the Collatz
 *       sequence starting from that number, and determines the number of steps
 *       until a value in the sequence repeats, indicating a cycle.
 *       This version is a Type III clone, featuring significant structural
 *       and stylistic modifications while preserving core functionality.
 */

/**
 * Computes the subsequent term in a Collatz sequence based on the current term.
 * For an even number, it divides by two. For an odd number, it applies 3n + 1.
 * Includes robust validation for input types and values.
 *
 * @param {number} currentTerm The current integer value in the Collatz sequence.
 * @returns {number} The next integer value in the sequence.
 * @throws {TypeError} If the input is not a valid integer.
 * @throws {RangeError} If the input is a non-positive integer, as Collatz conjecture applies to positive integers.
 */
const calculateNextCollatzTerm = (currentTerm) => {
  // Ensuring the input is a number and an integer (Type III addition for robustness)
  if (typeof currentTerm !== 'number' || !Number.isInteger(currentTerm)) {
    throw new TypeError(`Collatz term calculation expects an integer, received: ${currentTerm} (${typeof currentTerm}).`);
  }

  // Collatz conjecture is conventionally applied to positive integers.
  // This guard clause explicitly handles non-positive inputs (Type III addition).
  if (currentTerm <= 0) {
    throw new RangeError(`Collatz sequence is defined for positive integers only. Received: ${currentTerm}.`);
  }

  let nextValueInSequence;

  // Rewrite of the conditional logic from a ternary operator to an if-else block
  // for improved readability and as a Type III structural modification.
  if (currentTerm % 2 === 0) {
    nextValueInSequence = currentTerm / 2;
  } else {
    nextValueInSequence = currentTerm * 3 + 1;
  }

  return nextValueInSequence;
};

/**
 * Determines the total number of steps required in a Collatz sequence
 * until a previously encountered value is repeated, signifying a cycle.
 * This function handles input parsing and validates the starting number.
 *
 * @param {string} initialValueString The string representation of the positive integer
 *                                    from which the Collatz sequence should start.
 * @returns {number} The count of steps (including the starting value) until a repetition is found.
 *                   Returns 0 if the input is invalid or an error occurs.
 */
const determineCollatzCycleLength = (initialValueString) => {
  // Pre-processing and validation of the input string (Type III addition/update).
  const sanitizedInput = initialValueString.trim();
  const parsedStartingValue = parseInt(sanitizedInput, 10);

  // Extensive input validation (Type III addition).
  if (isNaN(parsedStartingValue) || !Number.isInteger(parsedStartingValue)) {
    console.error(`Input Error: Provided string '${initialValueString}' cannot be parsed into a valid integer.`);
    return 0; // Indicate failure due to invalid input format.
  }
  if (parsedStartingValue <= 0) {
    console.error(`Input Error: Collatz sequence requires a positive integer. Received: ${parsedStartingValue}.`);
    return 0; // Indicate failure due to out-of-range input.
  }

  // A Set is used to efficiently store and check for previously encountered numbers.
  // This allows for O(1) average time complexity for additions and lookups (Type II - renaming).
  const encounteredSequenceValues = new Set();

  let currentSequenceElement = parsedStartingValue;
  // The step counter starts at 1 for the initial value.
  // The original problem returns '2' for the first step after the initial value
  // if it immediately repeats. If 1 -> 4 -> 2 -> 1, it returns 4.
  // 'cycleIterationCount' is initialized to 2 to align with this logic,
  // representing the step number for the first calculated term.
  let cycleIterationCount = 2;

  // Add the initial value to the set of encountered numbers.
  encounteredSequenceValues.add(currentSequenceElement);

  // An alternative syntax for an infinite loop (Type III structural change).
  // This loop continues until a cycle is detected and a value is returned.
  for (;;) {
    let nextCalculatedTerm;
    try {
      // Use an intermediate variable for clarity (Type III addition).
      nextCalculatedTerm = calculateNextCollatzTerm(currentSequenceElement);
    } catch (error) {
      // Catch errors from `calculateNextCollatzTerm` (Type III addition).
      console.error(`Processing Error: Failed to calculate next Collatz term. ${error.message}`);
      return 0; // Indicate failure.
    }

    // Check if the newly computed term has already appeared in the sequence.
    if (encounteredSequenceValues.has(nextCalculatedTerm)) {
      // If a repetition is found, the current 'cycleIterationCount' holds the
      // total number of steps (including the initial term) until this cycle point.
      return cycleIterationCount;
    }

    // If the term is unique, add it to our history.
    encounteredSequenceValues.add(nextCalculatedTerm);

    // Update the current element for the next iteration of the loop.
    currentSequenceElement = nextCalculatedTerm;

    // Increment the step counter for the next iteration.
    cycleIterationCount++;

    // Safety mechanism: Add a hard limit to prevent excessively long or
    // theoretically non-terminating sequences from consuming all resources.
    // This is a Type III addition for robustness, especially for sequences
    // whose termination is not guaranteed (like Collatz for negative numbers,
    // or very large numbers where the conjecture is unproven).
    const MAX_SEQUENCE_LENGTH = 1000000;
    if (cycleIterationCount > MAX_SEQUENCE_LENGTH) {
      console.warn(`Warning: Sequence exceeded maximum allowed length of ${MAX_SEQUENCE_LENGTH} steps without detecting a cycle. Aborting.`);
      return 0; // Indicate that the limit was reached without a cycle.
    }
  }
};

/**
 * The primary execution routine of the program.
 * It orchestrates reading input, performing the Collatz cycle detection,
 * and outputting the result. Includes error handling for a robust execution flow.
 *
 * @param {string} rawInputFromStdin The raw content read from the standard input stream.
 */
function primaryExecutionRoutine(rawInputFromStdin) {
  // Wrap the core logic in a try-catch block for comprehensive error handling (Type III addition).
  try {
    const computedCycleLength = determineCollatzCycleLength(rawInputFromStdin);

    // Output the result using a template literal for modern JavaScript syntax (Type III update).
    console.log(`${computedCycleLength}`);
  } catch (executionError) {
    // Log any unexpected errors that might occur during the main routine.
    console.error(`An unhandled exception occurred during program execution: ${executionError.message}`);
    // In a production environment, one might also exit with a non-zero status code here.
    // process.exit(1);
  }
}

// Module for file system operations (Type II - renaming).
const fileSystemModule = require('fs');
// Standard input file path (Type II - renaming).
const standardInputFilePath = '/dev/stdin';

// Read the entire content from standard input synchronously.
// The `.toString().trim()` ensures that the input is treated as a string
// and any leading/trailing whitespace or newlines are removed,
// which is a common requirement for processing console input (Type III update).
const processedInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8').toString().trim();

// Invoke the main program function with the prepared input.
primaryExecutionRoutine(processedInputContent);