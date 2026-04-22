'use strict'; // This directive enforces stricter parsing and error handling rules in the script.

/**
 * This primary function is designed to process a given textual input,
 * perform a series of numerical calculations, and then output a specific integer result.
 *
 * @param {string} inputString - The complete raw string received as input,
 *                                typically from a standard input stream.
 */
function calculateValue(inputString) {
  // First, we prepare the input data for numerical processing.
  // The input string is trimmed of any leading or trailing whitespace,
  // then split into an array of individual string elements based on space delimiters.
  // Finally, each string element is explicitly converted into a numerical type.
  const inputValues = inputString.trim().split(' ').map(item => Number(item));

  // Initialize a variable to store the final computed outcome.
  // A starting value of -1 is used to signify that no valid result has been found yet.
  let resultIdentifier = -1;

  // Determine an upper bound for our iterative search.
  // This limit is derived by dividing the first processed input value by a constant factor (0.08),
  // and then truncating the result to the nearest whole number.
  const upperLimit = Math.trunc(inputValues[0] / 0.08);

  // Similarly, a lower bound is calculated using the second input value and a different factor (0.10).
  // While 'lowerBound' is computed, it's not directly utilized in the loop's termination condition
  // within this specific algorithm, but could be for other checks or future enhancements.
  const lowerBound = Math.trunc(inputValues[1] / 0.10);

  // Commence a loop that iterates through potential integer values.
  // The loop starts from 1 and continues as long as the 'counter' is less than or equal to the 'upperLimit'.
  for (let counter = 1;
              counter <= upperLimit; // The loop's continuation condition.
              ++counter) {          // Increments the 'counter' for the next iteration.

    // Within each iteration, evaluate if the current 'counter' satisfies two distinct conditions.
    // These conditions involve multiplying 'counter' by specific decimal constants (0.08 and 0.10),
    // truncating the results, and comparing them against the original first and second input values.
    if (Math.trunc(counter * 0.08) === inputValues[0] &&
        Math.trunc(counter * 0.10) === inputValues[1]) {
      // If both conditions are met, the current 'counter' value is considered a valid match.
      // We assign this matching 'counter' to our 'resultIdentifier'.
      // The loop continues, which means if multiple such 'counter' values exist,
      // the 'resultIdentifier' will ultimately hold the largest one found.
      resultIdentifier = counter;
    }
    // No explicit 'else' branch is required here, as 'resultIdentifier' is only updated upon a successful match.
  }

  // After the loop has completed its execution, the final 'resultIdentifier' value
  // (which will either be the found number or the initial -1) is printed to the console.
  // console.info is used here as an alternative to console.log, providing similar output functionality.
  console.info(resultIdentifier);
}

// This is the main entry point for the script's execution flow.
// It reads the entire content of the standard input stream ('/dev/stdin') synchronously,
// interpreting it as a 'utf-8' encoded string.
// The obtained string content is then passed as an argument to the 'calculateValue' function,
// initiating the core logic of the program.
calculateValue(require('fs').readFileSync('/dev/stdin', 'utf-8'));